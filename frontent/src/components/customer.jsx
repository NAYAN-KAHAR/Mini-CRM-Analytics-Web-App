import { useEffect, useState } from "react";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';


const Customer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  const [csv, setCsv] = useState('');
  const [csvName, setCsvName] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if(csv){
      try{
          const csvFile = new FormData();
          csvFile.append('file', csv);
          // console.log('file', csv);
          const res =  await axios.post(`http://localhost:8000/api/upload/customers-csv`, csvFile);
          console.log('sented', res.data)
          fetchAllCustomers();
          setCsvName('');
          setCsv('');
          toast.success("Customer created");
      }catch(err){
        console.log(err)
      }
      return 
    }



    if(!name.trim() || !email.trim() || !phone.trim() || !company.trim()){
      return alert('Fields are missing');
    }

    const customer = { name, email, phone, company}
    console.log('customer', customer);
    try{
      if(!csv.trim()){
          if(isEdit && editId){
            const res = await axios.put(`http://localhost:8000/api/contacts-update/${editId}`, customer);
            console.log(res.data);
            setIsEdit(false);
            setEditId(null);
            toast.success("Customer updated");

          }else{
             const res = await axios.post(`http://localhost:8000/api/post/contact`, customer);
            toast.success("Customer created");
          }
         
          //  console.log(res.data)
          setName(''); setEmail(''); setPhone(''); setCompany('')

          fetchAllCustomers();
      }else{
        console.log('yes csv comming');
      }
    
    }catch(err){console.log(err)}
  
  };


  const fetchAllCustomers = async () => {
    try{
      const res = await axios.get(`http://localhost:8000/api/get/contacts`);
      // console.log(res.data);
      setCustomers(res.data);
      setAllCustomers(res.data)
    }catch(err){
      console.log(err)
    }
  }

useEffect(() => {
    fetchAllCustomers();
  },[]);


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

  // handle Delete logic
  const handleDel = async (id) => {
    if(!id) return;
    console.log(id);
    try{
      const res = await axios.delete(`http://localhost:8000/api/contacts-delete/${id}`);
      console.log(res.data);
      toast.success(res.data);
      fetchAllCustomers();
    }catch(err){
      console.log(err)
    }
  }

  // handle Edit logic
  const handleEdit = async (customer) => {
    console.log(customer);
    setEditId(customer.id);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setCompany(customer.company);
    window.scroll(0,0);
    setIsEdit(true)
  }

// handle export csv file logic
const exportCsv = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/export/contacts', {
      responseType: 'blob', 
    });

    // Create a blob from the response data
    const blob = new Blob([res.data], { type: 'text/csv' });

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts.csv'; 
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link); 
  } catch (err) {
    console.log('CSV Export Error:', err);
  }
};




  return (
    <>
    <ToastContainer />
      <div className="flex flex-col items-center w-screen min-h-screen bg-white mt-12 px-4">
   
      <div className="mt-6 max-w-xl w-full  bg-white p-5 shadow-sm rounded-xl">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">Add Customers</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex flex-col gap-4">
         
            <div className="flex gap-3 items-center md:flex-row flex-col">
              <div className="w-full">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input id="name" type="text"  placeholder="Name" value={name} 
                   onChange={(e) =>setName(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150"
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" type="email"  placeholder="Email" value={email}
                 onChange={(e) =>setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150"
                />
              </div>
            </div>

        
           <div className="flex gap-3 items-center md:flex-row flex-col">
              <div className="w-full">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input id="phone" type="number"  placeholder="Phone" value={phone}
                 onChange={(e) =>setPhone(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150"
                />
              </div>
              <div className="w-full">
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                <input id="company" type="text"  placeholder="Company" value={company}
                 onChange={(e) =>setCompany(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-150"
                />
              </div>
            </div>

      <div className="flex items-center my-4 gap-2">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="mx-2 text-gray-500">Or</span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>


            <div className="flex items-center justify-between w-full px-4 py-1 border border-gray-300 rounded-lg shadow-sm">
              <input id="file" name="csv" type="file" accept=".csv" className="hidden"
                onChange={(e) => { setCsv(e.target.files[0]),  setCsvName(e.target.files[0].name); }   } />
              <span className="text-gray-900 text-sm">{ csvName ? csvName :'Choose CSV'}</span>

              <label htmlFor="file" className="px-4 py-2 bg-violet-900 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition cursor-pointer">Import</label>
            </div>

            {/* Submit */}
            <button type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-900 hover:bg-violet-700 transition cursor-pointer">
              {isEdit ? 'Update':'Add'} Customer</button>
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
    
      <div className="mt-2 w-full max-w-4xl h-[400px] overflow-y-auto mb-10">
       

     
        {customers.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">#Id</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Phone</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Company</th>
                   <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index} className="border-t">
                     <td className="px-4 py-2 border">{index +1}</td>
                    <td className="px-4 py-2 border">{customer.name}</td>
                    <td className="px-4 py-2 border">{customer.email}</td>
                    <td className="px-4 py-2 border">{customer.phone}</td>
                    <td className="px-4 py-2 border">{customer.company}</td>
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

export default Customer;
