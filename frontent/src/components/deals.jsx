import { useEffect, useState } from "react";
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment'

const Deals = () => {
  const [csv, setCsv] = useState('');
  const  [csvName, setCsvName] = useState('');

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState('');
  const [dealDate, setDealDate] = useState('');
  const [contact, setContact] = useState('');
  
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(''); 


  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  const [customersName, setCustomersName] = useState([]);

  const fetchAllCustomers = async () => {
    try{
      const res = await axios.get('http://localhost:8000/api/get/deals-contacts-name');
      // console.log(res.data);
      setCustomersName(res.data);
    }catch(err){
      console.log(err)
    }
  };

  const fetchAllDelasCustomers = async () => {
    try{
      const res = await axios.get(`http://localhost:8000/api/get/deals-contacts`);
      // console.log(res.data);
      setCustomers(res.data);
      setAllCustomers(res.data);

    }catch(err){
      console.log(err)
    }
  }
  useEffect(() => {
    fetchAllCustomers();
    fetchAllDelasCustomers();
  },[]);

//upload/deal-customers-csv"
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(csv){
      try{
          const csvFile = new FormData();
          csvFile.append('file', csv);
          // console.log('file', csv);
          const res =  await axios.post(`http://localhost:8000/api/upload/deal-customers-csv`, csvFile);
          console.log('sented', res.data)
          fetchAllCustomers();
          setCsvName('');
          setCsv('');
          toast.success('deal created successful')
          fetchAllDelasCustomers();
      }catch(err){
        console.log(err)
      }
      return 
    }


    console.log({name, amount,stage, dealDate,contact});

    if(!name.trim() || amount === '' || isNaN(amount) || Number(amount) <= 0 || isNaN(amount) || !stage.trim() 
      || !dealDate.trim() || !contact.trim()){
      return alert('All fields are required')
    }
      // customer data
      const dealsCustomer = {
        name,
        amount: parseFloat(amount),
        stage,
        date: moment(dealDate).format('YYYY-MM-DDT00:00:00'),
        contact
      };


    try{
      if(!csv.trim()){
          if(isEdit && editId){
            const res = await axios.put(`http://localhost:8000/api/contacts-deal-update/${editId}`, dealsCustomer);
            // console.log(res.data);
            setIsEdit(false);
            setEditId(null);
            toast.success("Customer updated");
            fetchAllDelasCustomers();
          }else{
            const res = await axios.post(`http://localhost:8000/api/post/deals-contacts`, dealsCustomer);
            console.log(res.data);
            fetchAllDelasCustomers();
            toast.success('deal created successful');
          }

            setName('');
            setAmount('');
            setContact('');
            setStage('');
            setDealDate('');
         
      }
    }catch(err){
      if (err.response) {
       console.error("Validation errors:", err.response.data);}
       console.log(err)
    }
  };


const exportCsv = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/export/contacts', {
      responseType: 'blob', // 🔥 important: tells axios to treat response as a binary file
    });

    // Create a blob from the response data
    const blob = new Blob([res.data], { type: 'text/csv' });

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customer_deals.csv'; // Set the file name
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Cleanup
  } catch (err) {
    console.log('CSV Export Error:', err);
  }
};

// handle Edit logic
  const handleEdit = async (customer) => {
    console.log(customer);
    setEditId(customer.id);
    setName(customer.name);
    setAmount(customer.amount);
    setStage(customer.stage);
    setContact(customer.contact);

    console.log('before',customer.date);
    const formattedDate = moment(customer.date).format('YYYY-MM-DD');
    setDealDate(formattedDate);  // Set the correctly formatted date
    console.log('after',formattedDate);

    window.scroll(0,0);
    setIsEdit(true)
  }

//delete deal customer
const handleDel = async (id) => {
  try{
      const res = await axios.delete(`http://localhost:8000/api/deals-delete/${id}`);
      console.log(res.data);
      toast.success(res.data);
      fetchAllDelasCustomers();
  }catch(err){
      console.log()
  }
}

const handleSearch = (e) => {
      const query = e.target.value.toLowerCase();
      if(query){
        const filtered = allCustomers.filter((value) =>
        value.name.toLowerCase().includes(query));
        setCustomers(filtered)
      }else{
        setCustomers(allCustomers);
      }
  }
  return (
    <>
    <ToastContainer />
    <div className="flex flex-col items-center w-screen min-h-screen bg-white mt-12 px-4">
   
      <div className="max-w-xl w-ful bg-white p-5 shadow-sm rounded-xl">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">Customer's Deals</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex flex-col gap-4">
         
        <div className="flex gap-3 items-center md:flex-row flex-col">
              <div className="w-full">
               
                <select  onChange={(e) => setName(e.target.value)}  value={name}  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150" name="" id="" required>
                   <option value="nk">Select Customer</option>
                   {customersName.length> 0 && customersName && customersName.map((value,i) => {
                    return   <option value={value} key={i}>{value}</option>
                   })}
                </select>
              </div>
             
             <div className="w-full">
                <input id="amount" type="number"  placeholder="Amount" 
                  onChange={(e) => setAmount(e.target.value)} value={amount}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150"
                />
              </div>

            </div>

            <div className="flex gap-3 items-center md:flex-row flex-col">
              <div className="w-full">
               <select  onChange={(e) => setStage(e.target.value)} value={stage}  
               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150" name="" id="" required>
                  <option value="nk">Select Stage</option>
                  <option value="Lead">Lead</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Convert">Convert</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost"> Closed Lost</option>
                 
                </select>
              </div>
              

                <div className="w-full">
                <input id="date" name="date" type="date" 
                 onChange={(e) =>{ setDealDate(e.target.value); console.log(e.target.value)} }  value={dealDate} 
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150"
                />
              </div>

            </div>


            <div className="w-full">
                <input id="contact" name="contact" type="number"  placeholder="Contact"
                onChange={(e) => setContact(e.target.value)}  value={contact}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150"
                />
              </div>


              <div className="flex items-center my-4 gap-2">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="mx-2 text-gray-500">Or</span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>

            
            <div className="flex items-center justify-between w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm">
              <input id="file" name="csv" type="file" accept=".csv" className="hidden"
                 onChange={(e) => { setCsv(e.target.files[0]),  setCsvName(e.target.files[0].name); }} />
              <span className="text-gray-600 text-sm">{csvName ? csvName :'Choose CSV'}</span>

              <label htmlFor="file" className="px-4 py-2 bg-violet-900 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition cursor-pointer">Import</label>
            </div>

            {/* Submit */}
            <button type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-900 hover:bg-violet-700 transition cursor-pointer">
              {isEdit ? 'Update':'Add'} Deals</button>
          </div>
        </form>
      </div>


   <div className="mt-2 w-full max-w-4xl">
 <div className="flex justify-between items-center px-4 md:flex-row flex-col gap-2 mt-10">
          <h2 className="text-xl font-semibold">Customers</h2>
            <input type="text" className="w-full md:w-[60%] border outline-none p-2 rounded-lg" placeholder="Search Customer" onChange={handleSearch}/>

          <button onClick={exportCsv}  className="px-4 py-2 bg-violet-900 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition cursor-pointer"> Export Csv</button>
        </div>
</div>


 
      <div className="mt-10 w-full max-w-4xl">
    

  
        {customers.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">#Id</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Customer</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Stage</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Contact</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Date</th>
                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index} className="border-t">
                      <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{customer.name}</td>
                    <td className="px-4 py-2 border">{customer.amount}</td>
                    <td className="px-4 py-2 border">{customer.stage}</td>
                    <td className="px-4 py-2 border">{customer.contact}</td>
                    <td className="px-4 py-2 border">{moment(customer.date).format('DD-M-YYYY')}</td>
                     <td className="px-4 py-2 border">
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.8 bg-red-500 text-white cursor-pointer rounded-sm"
                        onClick={() => handleDel(customer.id)}>del</span> 
                        <span className="px-2 py-0.8 bg-yellow-500 text-white cursor-pointer rounded-sm"
                        onClick={() => handleEdit(customer)}>edit</span>
                      </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 mt-4 text-sm text-center">No customers added yet.</p>
        )}
      </div>
    </div>
    </>
  );
};

export default Deals;
