
from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Depends,Path
from fastapi.responses import JSONResponse,Response
from datetime import datetime 


from io import StringIO
import csv


from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select

from ..database import get_db  
from ..models.customer_model import Customer
from ..models.deals_model import DealsCustomer

from ..schemas.deals_schema import DealsSchema


router = APIRouter()

# get only customer's name
@router.get('/api/get/deals-contacts-name')
async def get_all_contacts(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Customer.name))
        exist_customer = result.scalars().all()

        return exist_customer

    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500,detail='Internal Server Error')
    



# post deal customer logic
@router.post('/api/post/deals-contacts')
async def get_all_contacts(deals: DealsSchema, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(DealsCustomer).where(DealsCustomer.contact == deals.contact))
        exist_customer = result.scalars().first()
        if exist_customer:
            raise HTTPException(status_code=500,detail='Deal alread done')
       
        new_deals =  DealsCustomer(
            name = deals.name,
            amount = deals.amount,
            stage = deals.stage,
            date = deals.date,
            contact = deals.contact
        )

        db.add(new_deals)
        await db.commit()
        await db.refresh(new_deals)

        return JSONResponse( status_code=201,content={"message": "deal created successful"})
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500,detail='Internal Server Error')
    




# get deal customer logic
@router.get('/api/get/deals-contacts')
async def get_all_contacts(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(DealsCustomer))
        exist_customer = result.scalars().all()

        if not exist_customer:
            raise HTTPException(status_code=404, detail='Customer not found')

        return exist_customer
    
    except SQLAlchemyError as e:
        print(e)
        raise HTTPException(status_code=500,detail='Internal Server Error')
    




# import csv file 
@router.post("/api/upload/deal-customers-csv")
async def upload_csv(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    try:
        content = file.file.read().decode('utf-8')
        csv_reader = csv.DictReader(StringIO(content))

        count = 0
        for row in csv_reader:

            # Convert headers to lowercase (if needed)
            name = row.get("Customer", "").lower() if row.get("Customer") else None
            amount = row.get("Amount", "") if row.get("Amount") else None
            stage = row.get("Stage", "").lower() if row.get("Stage") else None
            date_str = row.get("Date", "") if row.get("Date") else None  # Use a temporary variable for the date string
            contact = row.get("Contact", "").lower() if row.get("Contact") else None

            # Skip invalid rows with missing information
            if not name or not amount or not stage or not date_str or not contact:
                print(f"Skipping invalid row due to missing fields: {row}")
                continue

            # Additional validation: check if 'amount' is numeric and 'date' is valid
            try:
                amount = float(amount)  # Ensure amount is numeric
            except ValueError:
                print(f"Skipping row with invalid amount: {row}")
                continue  # Skip row if amount is not valid

            # Validate date format and convert it to a datetime.date object
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d").date()  # Convert string to date object
            except ValueError:
                print(f"Skipping row with invalid date format: {row}")
                continue  # Skip row if date format is incorrect

        
            result = await db.execute(select(DealsCustomer).where(DealsCustomer.contact == contact))
            existing = result.scalars().first()

            if existing:
                print(f"Duplicate contact found: {contact}, skipping row.")
                continue  

            # Add new deal customer to the database
            new_deals_customer = DealsCustomer(
                name=name,
                amount=amount,
                stage=stage,
                date=date, 
                contact=contact,
            )
            db.add(new_deals_customer)
            count += 1

        await db.commit()
        return {"message": f"CSV processed successfully. {count} customers added."}

    except Exception as e:
        print(f"Error during CSV upload: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process CSV")





# CSV export logic (GET request)
@router.get("/api/export/deal-customers")
async def export_contacts_csv(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Customer))
        deals_customers = result.scalars().all()

        # Prepare the output to write CSV content
        output = StringIO()
        writer = csv.writer(output)

       # Write the header to the CSV file (fields: name, stage, amount, contact, date)
        writer.writerow(["Name", "Stage", "Amount", "Contact", "Date"])

        # Write each deal customer data row to the CSV
        for c in deals_customers:
            writer.writerow([c.name, c.stage, c.amount, c.contact, c.date])

        # Return the CSV file as a downloadable response
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=contacts.csv"}
        )

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
    




# Customer Deals Delete Logic
@router.delete('/api/deals-delete/{id}')
async def delete_customer(db:AsyncSession = Depends(get_db), id:int = Path(..., title='Customer id')):
    try:
        result = await db.execute(select(DealsCustomer).where(DealsCustomer.id == id))
        customer = result.scalars().first()
        if not customer:
            raise HTTPException(status_code=400, detail='Bad request')
        
        await db.delete(customer)
        await db.commit()
        

        return Response(status_code=200, content='deleted successfully')
    
    except Exception:
        raise HTTPException(status_code=500, detail="Server Error")




# deals update logic
@router.put('/api/contacts-deal-update/{id}')
async def update_customer(customer: DealsSchema, db: AsyncSession = Depends(get_db), id: int = Path(..., title='Customer id')):
    try:
        print("Received customer data:", customer)  # Log the incoming customer data
        result = await db.execute(select(DealsCustomer).where(DealsCustomer.id == id))
        curr_customer = result.scalars().first()

        if not curr_customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Update customer attributes
        curr_customer.name = customer.name
        curr_customer.amount = customer.amount
        curr_customer.stage = customer.stage
        curr_customer.date = customer.date
        curr_customer.contact = customer.contact

        await db.commit()
        await db.refresh(curr_customer)

        return {"message": "Customer updated successfully!"}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
