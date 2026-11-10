"""
InfraScan Backend API & Services Automated Test Suite
Executes end-to-end integration and unit tests across all REST endpoints.
"""
import os
import unittest
import numpy as np
import cv2
from starlette.testclient import TestClient

# Ensure backend is on path
import sys
from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.services.preprocessing import assess_and_preprocess_image
from app.services.report_generator import generate_pdf_report

class TestBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db = SessionLocal()
        try:
            init_db(db)
        finally:
            db.close()

        cls.client = TestClient(app)
        # Create a sample test image for uploads
        cls.test_dir = BACKEND_DIR / "tests" / "fixtures"
        cls.test_dir.mkdir(parents=True, exist_ok=True)
        cls.test_img_path = cls.test_dir / "test_concrete_sample.jpg"

        # Generate a synthetic concrete crack sample image (640x480)
        img = np.full((480, 640, 3), 160, dtype=np.uint8)
        # Add random texture noise
        noise = np.random.randint(-20, 20, (480, 640, 3), dtype=np.int16)
        img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        # Draw a synthetic crack line
        cv2.polylines(img, [np.array([[120, 100], [240, 220], [380, 280], [520, 410]])], False, (40, 40, 40), 3)
        cv2.imwrite(str(cls.test_img_path), img)

    def test_01_root_and_health_check(self):
        """Verify root gateway and system health diagnostics."""
        r = self.client.get("/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("platform", r.json())
        self.assertEqual(r.json()["status"], "online")

        hr = self.client.get("/health")
        self.assertEqual(hr.status_code, 200)
        self.assertEqual(hr.json()["status"], "healthy")
        self.assertEqual(hr.json()["database"]["status"], "connected")

        rr = self.client.get("/ready")
        self.assertEqual(rr.status_code, 200)
        self.assertTrue(rr.json()["ready"])

    def test_02_auth_and_user_management(self):
        """Test authentication login, JWT issuance, profile retrieval, and user CRUD."""
        # Login
        login_resp = self.client.post("/api/v1/auth/login", json={
            "email": "jordan.smith@infrastructure.gov",
            "password": "password123",
            "role": "Infrastructure Manager"
        })
        self.assertEqual(login_resp.status_code, 200)
        data = login_resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        token = data["access_token"]

        # Authenticated profile
        headers = {"Authorization": f"Bearer {token}"}
        me_resp = self.client.get("/api/v1/auth/me", headers=headers)
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()["email"], "jordan.smith@infrastructure.gov")

        # List users
        users_resp = self.client.get("/api/v1/auth/users", headers=headers)
        self.assertEqual(users_resp.status_code, 200)
        self.assertIsInstance(users_resp.json(), list)
        self.assertGreater(len(users_resp.json()), 0)

        # Create new user
        test_email = "test.inspector@infrascan.gov"
        new_user = self.client.post("/api/v1/auth/users", json={
            "name": "Alex Mercer",
            "email": test_email,
            "role": "Infrastructure Inspector",
            "department": "Civil Infrastructure Division",
            "status": "Active"
        })
        self.assertIn(new_user.status_code, [200, 201])
        user_id = new_user.json()["id"]

        # Update user
        update_resp = self.client.patch(f"/api/v1/auth/users/{user_id}", json={
            "role": "Civil Engineer",
            "status": "Inactive"
        })
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(update_resp.json()["role"], "Civil Engineer")
        self.assertEqual(update_resp.json()["status"], "Inactive")

        # Delete test user
        del_resp = self.client.delete(f"/api/v1/auth/users/{user_id}")
        self.assertEqual(del_resp.status_code, 200)

    def test_03_assets_full_crud(self):
        """Verify complete asset lifecycle (Create, Read, Update, Delete, Filter)."""
        asset_id = "AST-TST-9901"
        # 1. Create
        create_resp = self.client.post("/api/v1/assets", json={
            "id": asset_id,
            "name": "Metropolitan Suspension Bridge",
            "type": "Bridge",
            "address": "Mile 14, Riverside Expressway",
            "latitude": 40.7306,
            "longitude": -73.9352,
            "constructionYear": 1998,
            "materialType": "Prestressed Concrete",
            "importance": "Critical National Infrastructure",
            "conditionStatus": "Good",
            "inspectionFrequencyMonths": 6
        })
        self.assertEqual(create_resp.status_code, 200)
        self.assertEqual(create_resp.json()["id"], asset_id)

        # 2. Get by ID
        get_resp = self.client.get(f"/api/v1/assets/{asset_id}")
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.json()["name"], "Metropolitan Suspension Bridge")

        # 3. List with filtering
        filter_resp = self.client.get("/api/v1/assets?type=Bridge")
        self.assertEqual(filter_resp.status_code, 200)
        self.assertTrue(any(a["id"] == asset_id for a in filter_resp.json()))

        # 4. Update
        patch_resp = self.client.patch(f"/api/v1/assets/{asset_id}", json={
            "conditionStatus": "Fair",
            "notes": "Surface microfissures observed on pier 2."
        })
        self.assertEqual(patch_resp.status_code, 200)
        self.assertEqual(patch_resp.json()["conditionStatus"], "Fair")

        # 5. Delete
        del_resp = self.client.delete(f"/api/v1/assets/{asset_id}")
        self.assertEqual(del_resp.status_code, 200)

    def test_04_maintenance_work_orders_crud(self):
        """Verify work orders creation, retrieval, status transition, and deletion."""
        wo_id = "WO-TST-8801"
        create_resp = self.client.post("/api/v1/work-orders", json={
            "id": wo_id,
            "title": "Epoxy Crack Injection - Pier 3",
            "assetId": "AST-BRG-0048",
            "assetName": "North River Bridge",
            "inspectionId": "INSP-2024-0248",
            "priority": "High Priority",
            "status": "Assigned",
            "assignedTeam": "Specialized Concrete Unit",
            "assignedEngineer": "Sarah Lin",
            "dueDate": "2026-12-01",
            "repairRecommendations": "Inject low-viscosity non-shrink polymer resin."
        })
        self.assertEqual(create_resp.status_code, 200)
        self.assertEqual(create_resp.json()["id"], wo_id)

        # Get work order
        get_resp = self.client.get(f"/api/v1/work-orders/{wo_id}")
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.json()["status"], "Assigned")

        # Status transition to Completed with notes
        patch_resp = self.client.patch(f"/api/v1/work-orders/{wo_id}/status", json={
            "status": "Completed",
            "notes": "Polymer resin injected and cured. Pressure testing passed."
        })
        self.assertEqual(patch_resp.status_code, 200)
        self.assertEqual(patch_resp.json()["status"], "Completed")
        self.assertIsNotNone(patch_resp.json()["completedAt"])

        # Delete
        del_resp = self.client.delete(f"/api/v1/work-orders/{wo_id}")
        self.assertEqual(del_resp.status_code, 200)

    def test_05_inspections_crud_and_review(self):
        """Verify inspection registration, engineer sign-off review, and deletion."""
        insp_id = "INSP-TST-7701"
        create_resp = self.client.post("/api/v1/inspections", json={
            "id": insp_id,
            "assetId": "AST-BRG-0048",
            "assetName": "North River Bridge",
            "assetType": "Bridge",
            "title": "East Pier Substructure Survey",
            "inspectionType": "Routine",
            "inspectorName": "Marcus Vance",
            "priority": "High",
            "status": "Pending Engineer Review"
        })
        self.assertEqual(create_resp.status_code, 200)
        self.assertEqual(create_resp.json()["id"], insp_id)

        # Test Live AI Pipeline execution on inspection photo
        with open(self.test_img_path, "rb") as f:
            analyze_resp = self.client.post(
                f"/api/v1/inspections/{insp_id}/analyze",
                files={"file": ("test_concrete_sample.jpg", f, "image/jpeg")}
            )
        self.assertEqual(analyze_resp.status_code, 200)
        ai_data = analyze_resp.json()
        self.assertEqual(ai_data["status"], "Inference Complete")
        self.assertIn("findings", ai_data)
        self.assertIn("image", ai_data)
        self.assertIn("annotatedUrl", ai_data["image"])
        self.assertIn("maskUrl", ai_data["image"])
        self.assertIn("heatmapUrl", ai_data["image"])

        # Engineer review
        review_resp = self.client.post(f"/api/v1/inspections/{insp_id}/review", json={
            "reviewStatus": "Approved",
            "comments": "Principal shear crack detected requires immediate monitoring gauge.",
            "reviewer": "Elena Rostova, SE"
        })
        self.assertEqual(review_resp.status_code, 200)
        self.assertEqual(review_resp.json()["engineerReviewStatus"], "Approved")
        self.assertEqual(review_resp.json()["status"], "Completed")

        # Cleanup
        del_resp = self.client.delete(f"/api/v1/inspections/{insp_id}")
        self.assertEqual(del_resp.status_code, 200)

    def test_06_preprocessing_service_and_endpoint(self):
        """Test image blur detection, CLAHE contrast enhancement, and endpoint."""
        # 1. Direct Python service test
        service_res = assess_and_preprocess_image(str(self.test_img_path))
        self.assertIn("qualityScore", service_res)
        self.assertIn("blurScore", service_res)
        self.assertIn("preprocessedUrl", service_res)
        self.assertGreater(service_res["qualityScore"], 0)

        # 2. REST API endpoint test
        with open(self.test_img_path, "rb") as f:
            api_resp = self.client.post(
                "/api/v1/inspections/preprocess",
                files={"file": ("test_concrete_sample.jpg", f, "image/jpeg")}
            )
        self.assertEqual(api_resp.status_code, 200)
        data = api_resp.json()
        self.assertEqual(data["filename"], "test_concrete_sample.jpg")
        self.assertIn("preprocessedUrl", data)
        self.assertIn("qualityScore", data)

    def test_07_reports_and_pdf_generation(self):
        """Test civil engineering audit report generation and physical PDF output."""
        rpt_id = "RPT-TST-6601"
        gen_resp = self.client.post("/api/v1/reports/generate", json={
            "id": rpt_id,
            "inspectionId": "INSP-2024-0248",
            "assetId": "AST-BRG-0048",
            "assetName": "North River Bridge",
            "assetType": "Bridge",
            "generatedBy": "Elena Rostova, SE",
            "severity": "Moderate",
            "findingsSummary": {
                "total": 4,
                "critical": 0,
                "severe": 1,
                "moderate": 2,
                "minor": 1
            },
            "recommendations": "1. Non-shrink polymer injection.\n2. Acoustic crack monitoring sensors."
        })
        self.assertEqual(gen_resp.status_code, 200)
        self.assertIn("downloadUrl", gen_resp.json())

        # Test download PDF endpoint
        dl_resp = self.client.get(f"/api/v1/reports/{rpt_id}/download")
        self.assertEqual(dl_resp.status_code, 200)
        self.assertEqual(dl_resp.headers["content-type"], "application/pdf")
        self.assertGreater(len(dl_resp.content), 1000)

        # Cleanup
        del_resp = self.client.delete(f"/api/v1/reports/{rpt_id}")
        self.assertEqual(del_resp.status_code, 200)

    def test_08_models_governance_api(self):
        """Test AI model benchmark registry endpoint."""
        r = self.client.get("/api/v1/models")
        self.assertEqual(r.status_code, 200)
        self.assertIsInstance(r.json(), list)
        self.assertGreater(len(r.json()), 0)
        first_model = r.json()[0]
        self.assertIn("name", first_model)
        self.assertIn("metrics", first_model)

if __name__ == "__main__":
    unittest.main()
