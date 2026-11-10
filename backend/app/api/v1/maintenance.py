import datetime
import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.maintenance import MaintenanceWorkOrder
from app.schemas.maintenance import (
    MaintenanceWorkOrderResponse,
    MaintenanceWorkOrderCreate,
    MaintenanceWorkOrderStatusUpdate,
)

router = APIRouter()

@router.get("", response_model=List[MaintenanceWorkOrderResponse])
def get_work_orders(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    asset_id: Optional[str] = Query(None, description="Filter by asset ID"),
    db: Session = Depends(get_db),
):
    """
    Retrieve civil maintenance work orders with optional status/priority filters.
    """
    query = db.query(MaintenanceWorkOrder)
    if status and status != "All":
        query = query.filter(MaintenanceWorkOrder.status == status)
    if priority and priority != "All":
        query = query.filter(MaintenanceWorkOrder.priority == priority)
    if asset_id:
        query = query.filter(MaintenanceWorkOrder.asset_id == asset_id)
    return query.order_by(MaintenanceWorkOrder.created_at.desc()).all()

@router.post("", response_model=MaintenanceWorkOrderResponse)
def create_work_order(data_in: MaintenanceWorkOrderCreate, db: Session = Depends(get_db)):
    """
    Generate a new infrastructure maintenance work order.
    """
    wo_id = data_in.id or f"WO-{datetime.date.today().year}-{db.query(MaintenanceWorkOrder).count() + 1040}"
    created_date = data_in.created_at or datetime.date.today().isoformat()

    item = MaintenanceWorkOrder(
        id=wo_id,
        title=data_in.title,
        asset_id=data_in.asset_id,
        asset_name=data_in.asset_name,
        inspection_id=data_in.inspection_id,
        finding_id=data_in.finding_id,
        priority=data_in.priority or "Medium Priority",
        status=data_in.status or "Open",
        assigned_team=data_in.assigned_team or "Structural Remediation Team",
        assigned_engineer=data_in.assigned_engineer or "Sarah Lin",
        created_at=created_date,
        due_date=data_in.due_date,
        repair_recommendations=data_in.repair_recommendations or "",
        completion_notes=data_in.completion_notes,
        follow_up_inspection_required=data_in.follow_up_inspection_required if data_in.follow_up_inspection_required is not None else True,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/export/csv")
def export_work_orders_csv(db: Session = Depends(get_db)):
    """
    Export all maintenance work orders as CSV.
    """
    orders = db.query(MaintenanceWorkOrder).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Order ID", "Title", "Inspection ID", "Asset ID", "Asset Name", "Priority", "Status", "Assigned Team", "Assigned Engineer", "Created At", "Due Date"])
    for wo in orders:
        writer.writerow([
            wo.id, wo.title, wo.inspection_id, wo.asset_id, wo.asset_name,
            wo.priority, wo.status, wo.assigned_team, wo.assigned_engineer,
            wo.created_at, wo.due_date
        ])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=InfraScan_Work_Orders_Register.csv"}
    )

@router.get("/{work_order_id}", response_model=MaintenanceWorkOrderResponse)
def get_work_order(work_order_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information for a single maintenance work order.
    """
    item = db.query(MaintenanceWorkOrder).filter(MaintenanceWorkOrder.id == work_order_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Work order not found")
    return item

@router.delete("/{work_order_id}")
def delete_work_order(work_order_id: str, db: Session = Depends(get_db)):
    """
    Delete a maintenance work order.
    """
    item = db.query(MaintenanceWorkOrder).filter(MaintenanceWorkOrder.id == work_order_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Work order not found")
    db.delete(item)
    db.commit()
    return {"message": f"Work order {work_order_id} deleted successfully", "id": work_order_id}

@router.patch("/{work_order_id}/status", response_model=MaintenanceWorkOrderResponse)
def update_work_order_status(
    work_order_id: str,
    status_update: MaintenanceWorkOrderStatusUpdate,
    db: Session = Depends(get_db),
):
    """
    Update work order progression state and log engineer completion notes.
    """
    item = db.query(MaintenanceWorkOrder).filter(MaintenanceWorkOrder.id == work_order_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Work order not found")

    item.status = status_update.status
    if status_update.notes:
        item.completion_notes = status_update.notes
    if status_update.status == "Completed":
        item.completed_at = datetime.date.today().isoformat()

    db.commit()
    db.refresh(item)
    return item
