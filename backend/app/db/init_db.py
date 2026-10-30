import datetime
from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.models.user import User
from app.models.asset import Asset
from app.models.inspection import Inspection
from app.models.maintenance import MaintenanceWorkOrder
from app.models.model_version import ModelVersion
from app.models.report import InspectionReport
from app.core.security import get_password_hash

DEMO_USERS_SEED = [
    {
        "id": "USR-001",
        "name": "Jordan Smith, PE",
        "email": "jordan.smith@infrastructure.gov",
        "role": "Infrastructure Manager",
        "avatar": "JS",
        "department": "Civil Infrastructure Division",
        "status": "Active",
    },
    {
        "id": "USR-002",
        "name": "Elena Rostova, SE",
        "email": "elena.rostova@infrastructure.gov",
        "role": "Civil Engineer",
        "avatar": "ER",
        "department": "Bridge Engineering & Safety",
        "status": "Active",
    },
    {
        "id": "USR-003",
        "name": "Marcus Vance",
        "email": "marcus.vance@infrascan.io",
        "role": "Infrastructure Inspector",
        "avatar": "MV",
        "department": "Field Operations Unit",
        "status": "Active",
    },
    {
        "id": "USR-004",
        "name": "Sarah Lin",
        "email": "sarah.lin@publicworks.org",
        "role": "Maintenance Engineer",
        "avatar": "SL",
        "department": "Structures Maintenance Dept",
        "status": "Active",
    },
    {
        "id": "USR-005",
        "name": "David Kalu",
        "email": "david.kalu@infrastructure.gov",
        "role": "Administrator",
        "avatar": "DK",
        "department": "IT & Infrastructure Operations",
        "status": "Active",
    },
]

DEMO_ASSETS_SEED = [
    {
        "id": "AST-BRG-0048",
        "name": "North River Bridge",
        "type": "Bridge",
        "address": "Pier 4, Riverside Arterial, Waterfront District",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "construction_year": 1986,
        "material_type": "Prestressed Concrete",
        "responsible_department": "Bridge & Waterway Authority",
        "inspection_frequency_months": 6,
        "importance": "Critical National Infrastructure",
        "condition_status": "Fair",
        "last_inspection_date": "2024-09-24",
        "next_scheduled_inspection": "2025-03-24",
        "open_findings_count": 4,
        "maintenance_history_count": 14,
        "notes": "Main pier substructure exhibits hairline shear cracks under heavy freight loads.",
    },
    {
        "id": "AST-TUN-0012",
        "name": "Harbor Transit Tunnel",
        "type": "Tunnel",
        "address": "Interstate Sub-Bay Passage Mile 3.2",
        "latitude": 40.7061,
        "longitude": -74.0186,
        "construction_year": 1974,
        "material_type": "Reinforced Concrete",
        "responsible_department": "Metropolitan Transit Authority",
        "inspection_frequency_months": 3,
        "importance": "Critical National Infrastructure",
        "condition_status": "Good",
        "last_inspection_date": "2024-09-22",
        "next_scheduled_inspection": "2024-12-22",
        "open_findings_count": 2,
        "maintenance_history_count": 28,
        "notes": "Lining waterproof membrane inspected; minor moisture seepage around ring joint 42.",
    },
    {
        "id": "AST-BRG-0031",
        "name": "Eastside Highway Overpass",
        "type": "Bridge",
        "address": "East River Connector, Junction 14-B",
        "latitude": 40.7282,
        "longitude": -73.9776,
        "construction_year": 1968,
        "material_type": "Reinforced Concrete",
        "responsible_department": "State Dept of Transportation",
        "inspection_frequency_months": 3,
        "importance": "High",
        "condition_status": "Poor",
        "last_inspection_date": "2024-09-20",
        "next_scheduled_inspection": "2024-10-20",
        "open_findings_count": 7,
        "maintenance_history_count": 19,
        "notes": "Severe diagonal shear cracks observed on pier cap; spalling with visible rebar.",
    },
    {
        "id": "AST-DAM-0005",
        "name": "Highland Reservoir Dam",
        "type": "Dam",
        "address": "Cataract Spillway Gorge, Highland Basin",
        "latitude": 40.7812,
        "longitude": -74.0450,
        "construction_year": 1962,
        "material_type": "Reinforced Concrete",
        "responsible_department": "Water Resources & Dam Safety",
        "inspection_frequency_months": 6,
        "importance": "Critical National Infrastructure",
        "condition_status": "Fair",
        "last_inspection_date": "2024-08-30",
        "next_scheduled_inspection": "2025-02-28",
        "open_findings_count": 5,
        "maintenance_history_count": 22,
        "notes": "Spillway crest inspected post-monsoon; longitudinal hairline fissures require monitoring.",
    },
    {
        "id": "AST-RET-0027",
        "name": "Westside Retaining Wall",
        "type": "Retaining Wall",
        "address": "Palisades Slope, West Perimeter Road",
        "latitude": 40.7589,
        "longitude": -74.0210,
        "construction_year": 1991,
        "material_type": "Reinforced Concrete",
        "responsible_department": "Slope & Geotechnical Safety",
        "inspection_frequency_months": 12,
        "importance": "High",
        "condition_status": "Fair",
        "last_inspection_date": "2024-08-14",
        "next_scheduled_inspection": "2025-08-14",
        "open_findings_count": 3,
        "maintenance_history_count": 9,
        "notes": "Horizontal settlement fissures along bottom bench; drainage weepholes clear.",
    },
]

DEMO_INSPECTIONS_SEED = [
    {
        "id": "INSP-2024-0248",
        "asset_id": "AST-BRG-0048",
        "asset_name": "North River Bridge",
        "asset_type": "Bridge",
        "title": "Pier 4 Substructure Structural Crack Survey",
        "inspection_type": "Routine",
        "inspector_id": "USR-003",
        "inspector_name": "Marcus Vance",
        "inspector_role": "Lead Field Inspector",
        "date": "2024-09-24",
        "status": "Pending Engineer Review",
        "overall_severity": "Moderate",
        "priority": "High",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "findings_count": 2,
        "engineer_review_status": "Pending",
        "preprocessing_stage": "Completed",
        "report_generated": False,
        "images": [
            {
                "id": "IMG-0248-1",
                "filename": "pier4_south_face_highres.jpg",
                "url": "https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=1200&q=80",
                "uploadedAt": "2024-09-24T10:14:00Z",
                "resolution": "4032 x 3024",
                "fileSizeBytes": 4210000,
                "qualityScore": 94,
                "blurScore": "Pass",
                "findings": [
                    {
                        "id": "FND-0248-01",
                        "inspectionId": "INSP-2024-0248",
                        "category": "Cracks",
                        "crackType": "Diagonal",
                        "bbox": [28, 34, 42, 28],
                        "confidenceScore": 0.94,
                        "severity": "Moderate",
                        "measurements": {
                            "crackLengthPx": 412,
                            "avgWidthPx": 8.4,
                            "maxWidthPx": 14.2,
                            "areaPx": 3460,
                            "densityPercent": 4.8,
                            "orientationAngleDeg": 42.5,
                            "isCalibrated": False,
                            "uncertaintyNotes": "Camera calibration grid unverified. Measurements rendered in pixel units.",
                        },
                        "reviewStatus": "Pending Review",
                        "engineerNotes": "Follows typical diagonal principal tensile stress trajectory under girder load.",
                        "detectedAt": "2024-09-24T10:15:30Z",
                    },
                    {
                        "id": "FND-0248-02",
                        "inspectionId": "INSP-2024-0248",
                        "category": "Water leakage or staining",
                        "bbox": [22, 58, 30, 24],
                        "confidenceScore": 0.88,
                        "severity": "Minor",
                        "measurements": {
                            "crackLengthPx": 180,
                            "avgWidthPx": 3.2,
                            "maxWidthPx": 5.1,
                            "areaPx": 1200,
                            "densityPercent": 1.8,
                            "orientationAngleDeg": 90,
                            "isCalibrated": False,
                        },
                        "reviewStatus": "Pending Review",
                        "detectedAt": "2024-09-24T10:15:32Z",
                    },
                ],
            }
        ],
    },
    {
        "id": "INSP-2024-0247",
        "asset_id": "AST-TUN-0012",
        "asset_name": "Harbor Transit Tunnel",
        "asset_type": "Tunnel",
        "title": "Quarterly Lining & Waterproofing Assessment",
        "inspection_type": "Routine",
        "inspector_id": "USR-003",
        "inspector_name": "Marcus Vance",
        "inspector_role": "Lead Field Inspector",
        "date": "2024-09-22",
        "status": "Completed",
        "overall_severity": "Minor",
        "priority": "Medium",
        "latitude": 40.7061,
        "longitude": -74.0186,
        "findings_count": 1,
        "engineer_review_status": "Approved",
        "preprocessing_stage": "Completed",
        "report_generated": True,
        "images": [],
    },
]

DEMO_WORK_ORDERS_SEED = [
    {
        "id": "WO-2024-0089",
        "title": "Emergency Propping & Grout Injection - Pier Cap 3",
        "asset_id": "AST-BRG-0031",
        "asset_name": "Eastside Highway Overpass",
        "inspection_id": "INSP-2024-0246",
        "finding_id": "FND-0246-01",
        "priority": "Urgent Engineering Review",
        "status": "In Progress",
        "assigned_team": "Specialized Concrete Rehabilitation Unit",
        "assigned_engineer": "Sarah Lin",
        "created_at": "2024-09-21",
        "due_date": "2024-09-28",
        "repair_recommendations": "Temporary falsework erection followed by non-shrink epoxy polymer crack injection.",
        "follow_up_inspection_required": True,
    },
    {
        "id": "WO-2024-0084",
        "title": "Pier 4 Acoustic Crack Monitoring Gauge Installation",
        "asset_id": "AST-BRG-0048",
        "asset_name": "North River Bridge",
        "inspection_id": "INSP-2024-0248",
        "finding_id": "FND-0248-01",
        "priority": "High Priority",
        "status": "Assigned",
        "assigned_team": "Instrumentation Crew Alpha",
        "assigned_engineer": "Elena Rostova, SE",
        "created_at": "2024-09-24",
        "due_date": "2024-10-08",
        "repair_recommendations": "Mount vibrating wire displacement sensors across diagonal crack trajectory.",
        "follow_up_inspection_required": True,
    },
]

DEMO_MODELS_SEED = [
    {
        "id": "MDL-CRK-01",
        "name": "InfraScan CrackSeg v2.4",
        "version": "2.4.1-prod",
        "model_type": "YOLOv11-CrackSeg",
        "dataset_reference": "CivilCrack-National-v3",
        "dataset_version": "v3.2 (48,000 annotated bridge/tunnel crops)",
        "training_status": "Deployed (Production)",
        "evaluation_date": "2024-08-15",
        "deployment_status": "Active",
        "metrics": {
            "precision": 0.942,
            "recall": 0.918,
            "f1Score": 0.930,
            "mAP50": 0.924,
            "iouSegmentation": 0.812,
            "diceCoefficient": 0.884,
            "accuracy": 0.951,
        },
    },
    {
        "id": "MDL-CRK-02",
        "name": "DeepCrack-UNet Extended",
        "version": "1.9.0-eval",
        "model_type": "DeepCrack-UNet",
        "dataset_reference": "BridgeDeck-HighRes-2024",
        "dataset_version": "v1.4 (18,500 concrete tiles)",
        "training_status": "Validating",
        "evaluation_date": "2024-09-10",
        "deployment_status": "Canary",
        "metrics": {
            "precision": 0.908,
            "recall": 0.934,
            "f1Score": 0.921,
            "mAP50": 0.898,
            "iouSegmentation": 0.835,
            "diceCoefficient": 0.898,
            "accuracy": 0.938,
        },
    },
]

DEMO_REPORTS_SEED = [
    {
        "id": "RPT-2024-0246",
        "inspection_id": "INSP-2024-0246",
        "asset_id": "AST-BRG-0031",
        "asset_name": "Eastside Highway Overpass",
        "asset_type": "Bridge",
        "generated_at": "2024-09-20T17:00:00Z",
        "generated_by": "Elena Rostova, SE",
        "severity": "Severe",
        "findings_summary": {
            "total": 7,
            "critical": 1,
            "severe": 3,
            "moderate": 2,
            "minor": 1,
        },
        "recommendations": "Immediate structural shoring required. Lane closure recommended for heavy freight.",
        "model_version": "YOLOv11-CrackSeg v2.4.1",
        "file_formats_available": ["PDF", "CSV", "JSON"],
        "download_url": "/reports/RPT-2024-0246.pdf",
    }
]

def init_db(db: Session):
    Base.metadata.create_all(bind=engine)
    
    # 1. Seed users
    if db.query(User).count() == 0:
        for u in DEMO_USERS_SEED:
            db_user = User(
                id=u["id"],
                name=u["name"],
                email=u["email"],
                hashed_password=get_password_hash("password123"),
                role=u["role"],
                avatar=u["avatar"],
                department=u["department"],
                status=u["status"],
            )
            db.add(db_user)
        db.commit()

    # 2. Seed assets
    if db.query(Asset).count() == 0:
        for a in DEMO_ASSETS_SEED:
            db_asset = Asset(
                id=a["id"],
                name=a["name"],
                type=a["type"],
                address=a["address"],
                latitude=a["latitude"],
                longitude=a["longitude"],
                construction_year=a["construction_year"],
                material_type=a["material_type"],
                responsible_department=a["responsible_department"],
                inspection_frequency_months=a["inspection_frequency_months"],
                importance=a["importance"],
                condition_status=a["condition_status"],
                last_inspection_date=a["last_inspection_date"],
                next_scheduled_inspection=a["next_scheduled_inspection"],
                open_findings_count=a["open_findings_count"],
                maintenance_history_count=a["maintenance_history_count"],
                notes=a["notes"],
            )
            db.add(db_asset)
        db.commit()

    # 3. Seed inspections
    if db.query(Inspection).count() == 0:
        for insp in DEMO_INSPECTIONS_SEED:
            db_insp = Inspection(
                id=insp["id"],
                asset_id=insp["asset_id"],
                asset_name=insp["asset_name"],
                asset_type=insp["asset_type"],
                title=insp["title"],
                inspection_type=insp["inspection_type"],
                inspector_id=insp["inspector_id"],
                inspector_name=insp["inspector_name"],
                inspector_role=insp["inspector_role"],
                date=insp["date"],
                status=insp["status"],
                overall_severity=insp["overall_severity"],
                priority=insp["priority"],
                latitude=insp["latitude"],
                longitude=insp["longitude"],
                findings_count=insp["findings_count"],
                engineer_review_status=insp["engineer_review_status"],
                preprocessing_stage=insp["preprocessing_stage"],
                report_generated=insp["report_generated"],
                images=insp["images"],
            )
            db.add(db_insp)
        db.commit()

    # 4. Seed work orders
    if db.query(MaintenanceWorkOrder).count() == 0:
        for wo in DEMO_WORK_ORDERS_SEED:
            db_wo = MaintenanceWorkOrder(
                id=wo["id"],
                title=wo["title"],
                asset_id=wo["asset_id"],
                asset_name=wo["asset_name"],
                inspection_id=wo["inspection_id"],
                finding_id=wo.get("finding_id"),
                priority=wo["priority"],
                status=wo["status"],
                assigned_team=wo["assigned_team"],
                assigned_engineer=wo["assigned_engineer"],
                created_at=wo["created_at"],
                due_date=wo["due_date"],
                repair_recommendations=wo["repair_recommendations"],
                follow_up_inspection_required=wo["follow_up_inspection_required"],
            )
            db.add(db_wo)
        db.commit()

    # 5. Seed models
    if db.query(ModelVersion).count() == 0:
        for mdl in DEMO_MODELS_SEED:
            db_mdl = ModelVersion(
                id=mdl["id"],
                name=mdl["name"],
                version=mdl["version"],
                model_type=mdl["model_type"],
                dataset_reference=mdl["dataset_reference"],
                dataset_version=mdl["dataset_version"],
                training_status=mdl["training_status"],
                evaluation_date=mdl["evaluation_date"],
                deployment_status=mdl["deployment_status"],
                metrics=mdl["metrics"],
            )
            db.add(db_mdl)
        db.commit()

    # 6. Seed reports
    if db.query(InspectionReport).count() == 0:
        for rpt in DEMO_REPORTS_SEED:
            db_rpt = InspectionReport(
                id=rpt["id"],
                inspection_id=rpt["inspection_id"],
                asset_id=rpt["asset_id"],
                asset_name=rpt["asset_name"],
                asset_type=rpt["asset_type"],
                generated_at=rpt["generated_at"],
                generated_by=rpt["generated_by"],
                severity=rpt["severity"],
                findings_summary=rpt["findings_summary"],
                recommendations=rpt["recommendations"],
                model_version=rpt["model_version"],
                file_formats_available=rpt["file_formats_available"],
                download_url=rpt["download_url"],
            )
            db.add(db_rpt)
        db.commit()
