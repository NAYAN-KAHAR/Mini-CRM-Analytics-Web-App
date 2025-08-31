
from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Depends,Path
from fastapi.responses import JSONResponse,Response


from io import StringIO
import csv
from sqlalchemy import func

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select

from ..database import get_db  
from ..models.customer_model import Customer
from ..schemas.customer_schema import CustomerSchema



router = APIRouter()



@router.post('/api/post/contact')
async def contact_post(customer:CustomerSchema, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Customer).where(Customer.email == customer.email))
        exist_customer = result.scalars().first()

        if exist_customer:
             raise HTTPException(status_code=400, detail="Customer already exist.")
        
        new_customer = Customer(
            name = customer.name,
            email = customer.email,
            phone = customer.phone,
            company = customer.company,
        )
        db.add(new_customer)
        await db.commit()
        await db.refresh(new_customer)

        return JSONResponse( status_code=201,content={"message": "customer created successful"})
    
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500,detail='Internal Server Error')
    




#  get all customers 
@router.get('/api/get/contacts')
async def contact_post(db: AsyncSession = Depends(get_db),limit: int = 8, page: int = 1):
    try:

        total_result = await db.execute(select(func.count(Customer.id)))
        total_count = total_result.scalar_one()

        offset = (page - 1) * limit
        result = await db.execute(select(Customer).offset(offset).limit(limit))
        customers = result.scalars().all()

        if not customers and page != 1:
            raise HTTPException(status_code=404, detail='Customer not found')
        
        return {
            "data": customers,
            "total": total_count,
            "page": page,
            "limit": limit
        }
    
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500,detail='Internal Server Error')
    


       


# csv file hanle logic
@router.post("/api/upload/customers-csv")
async def upload_csv(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    try:
        content = file.file.read().decode('utf-8')
        csv_reader = csv.DictReader(StringIO(content))

        count = 0
        for row in csv_reader:
            # Convert header to lowercase to handle any case (Customer -> customer)
            name = row.get("name", "").lower() if row.get("name") else None
            email = row.get("email", "").lower() if row.get("email") else None
            phone = row.get("phone", "").lower() if row.get("phone") else None
            company = row.get("company", "").lower() if row.get("company") else None
         
            if not name or not email or not phone or not company:
                continue  # skip invalid rows

            # Avoid duplicate emails
            result = await db.execute(select(Customer).where(Customer.email == email))
            existing = result.scalars().first()

            if existing:
                continue

            new_customer = Customer(
                name=name,
                email=email,
                phone=phone,
                company=company
            )
            db.add(new_customer)
            count += 1

        await db.commit()  # ✅ Commit after adding all valid, unique customers
        return {"message": f"CSV processed successfully. {count} customers added."}

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail="Failed to process CSV")





# csv export logic
@router.get("/api/export/contacts")
async def export_contacts_csv(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Customer))
        contacts = result.scalars().all()

        output = StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow(["ID", "Name", "Email", "Phone","Company"])

        # Data
        for c in contacts:
            writer.writerow([c.id, c.name, c.email, c.phone, c.company]) 

        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=contacts.csv"}
        )

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")







# Customer Update Logic
@router.delete('/api/contacts-delete/{id}')
async def delete_customer(db:AsyncSession = Depends(get_db), id:int = Path(..., title='Customer id')):
    try:
        result = await db.execute(select(Customer).where(Customer.id == id))
        customer = result.scalars().first()
        if not customer:
            raise HTTPException(status_code=400, detail='Bad request')
        
        await db.delete(customer)
        await db.commit()
        

        return Response(status_code=200, content='deleted successfully')
    
    except Exception:
        raise HTTPException(status_code=500, detail="Server Error")



# customer Update Logic
@router.put('/api/contacts-update/{id}')
async def update_customer(customer:CustomerSchema, db:AsyncSession = Depends(get_db), id:int = Path(..., title='Customer id')):
    try:
        result = await db.execute(select(Customer).where(Customer.id == id))
        curr_customer = result.scalars().first()

        if not customer:
            raise HTTPException(status_code=400, detail='Bad request')
        
        curr_customer.name = customer.name
        curr_customer.email = customer.email
        curr_customer.phone = customer.phone
        curr_customer.company = customer.company

        await db.commit()
        await db.refresh(customer)
        return Response(status_code=200, content='updated successfully')

    except SQLAlchemyError as e:
        print(e)
        return  HTTPException (status_code=500, detail="Internal Server Error")




