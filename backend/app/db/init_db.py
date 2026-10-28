from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.models.user import User
from app.models.asset import Asset
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
        "id": "AST-101",
        "name": "Highland Valley Viaduct",
        "type": "Bridge",
        "location": "Sector 4, North County (KM 142)",
        "condition_score": 62,
        "status": "Needs Maintenance",
        "material": "Prestressed Concrete",
        "year_built": 1984,
        "latitude": 37.7749,
        "longitude": -122.4194,
    },
    {
        "id": "AST-102",
        "name": "Cascade Mountain Tunnel",
        "type": "Tunnel",
        "location": "Route 9, Milepost 48",
        "condition_score": 78,
        "status": "Under Review",
        "material": "Reinforced Shotcrete & Steel",
        "year_built": 1999,
        "latitude": 37.7833,
        "longitude": -122.4167,
    },
    {
        "id": "AST-103",
        "name": "Interstate 80 Overpass",
        "type": "Road",
        "location": "Junction 22A, Central Corridor",
        "condition_score": 91,
        "status": "Operational",
        "material": "Asphalt & Concrete Deck",
        "year_built": 2012,
        "latitude": 37.7650,
        "longitude": -122.4300,
    },
    {
        "id": "AST-104",
        "name": "Pinecrest Hydroelectric Dam",
        "type": "Dam",
        "location": "Clearwater Reservoir Spillway",
        "condition_score": 48,
        "status": "Critical",
        "material": "Mass Gravity Concrete",
        "year_built": 1972,
        "latitude": 37.7900,
        "longitude": -122.4050,
    },
    {
        "id": "AST-105",
        "name": "Metropolitan Civic Center Tower",
        "type": "Building",
        "location": "500 Government Way, Plaza Level",
        "condition_score": 88,
        "status": "Operational",
        "material": "Steel Frame & Concrete Core",
        "year_built": 2008,
        "latitude": 37.7550,
        "longitude": -122.4200,
    },
]

def init_db(db: Session):
    Base.metadata.create_all(bind=engine)
    
    # Seed users if empty
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

    # Seed assets if empty
    if db.query(Asset).count() == 0:
        for a in DEMO_ASSETS_SEED:
            db_asset = Asset(
                id=a["id"],
                name=a["name"],
                type=a["type"],
                location=a["location"],
                condition_score=a["condition_score"],
                status=a["status"],
                material=a["material"],
                year_built=a["year_built"],
                latitude=a["latitude"],
                longitude=a["longitude"],
            )
            db.add(db_asset)
        db.commit()
