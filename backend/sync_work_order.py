import datetime
from app.db.session import SessionLocal
from app.models.maintenance import MaintenanceWorkOrder
from app.models.inspection import Inspection

db = SessionLocal()
insp = db.query(Inspection).filter(Inspection.id == 'INSP-2026-1879').first()
if insp:
    existing = db.query(MaintenanceWorkOrder).filter(MaintenanceWorkOrder.inspection_id == insp.id).first()
    if not existing:
        suffix = insp.id.split('-')[-1]
        new_wo = MaintenanceWorkOrder(
            id=f"WO-2026-{suffix}",
            title="Low-Viscosity Epoxy Resin Crack Injection & Structural Sealing",
            asset_id=insp.asset_id or "AST-BRG-0048",
            asset_name=insp.asset_name or "North River Bridge",
            inspection_id=insp.id,
            finding_id="FND-2026-01",
            priority="High Priority",
            status="In Progress",
            assigned_team="Specialized Concrete Rehabilitation Unit",
            assigned_engineer="Sarah Lin",
            created_at="2026-11-10",
            due_date="2026-11-24",
            repair_recommendations="Low-pressure polymer resin injection along 532.5px diagonal rupture plane to restore tensile load transfer.",
            follow_up_inspection_required=True,
        )
        db.add(new_wo)
        db.commit()
        print(f"Created work order: {new_wo.id} for {insp.id}")

for w in db.query(MaintenanceWorkOrder).all():
    print(f"WO: {w.id} | {w.title} | {w.created_at} | {w.status}")

