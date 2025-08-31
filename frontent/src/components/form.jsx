import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer} from 'react-toastify';

const FormPage = () => {

  const [form, setForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleForm = async (e) => {
    e.preventDefault();
    if(!email.trim() ||  !password.trim()) return alert('missing fields');
    let res;
    try{
      if(form){
        // logic
        console.log(form);
        res = await axios.post('http://localhost:8000/api/auth/login', {email, password});
        console.log(res.data);
        toast.success(res.data.message);
        setTimeout(() => navigate('/dashboard'),2000);
        localStorage.setItem('user_id', res.data.user_id);
        
      }else{
        // signup
        console.log(form);
        res = await axios.post('http://localhost:8000/api/auth/signup', {email, password});
        console.log(res.data);
        setForm(!form);
      }
      setEmail('');
      setPassword('');

    }catch(err){
      // console.log(err.response?.data?.detail);
      if(err.response?.data?.detail=='User already exist.');
      setForm(!form);
    }
    
  }

  return (
   <>
     <ToastContainer />
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-100 flex items-center 
    justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-xl rounded-xl">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">{form ? 'Login':'SignUp'} Form</h1>

        <form className="mt-8 space-y-6" onSubmit={handleForm}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" required  placeholder="Enter your email" 
                onChange={(e) => setEmail(e.target.value)} value={email}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition duration-150"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" required value={password}
                placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition duration-150"
              />
            </div>

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-900 hover:bg-violet-700 transition cursor-pointer" > 
                {form ? 'Login':'Sign Up'}
            </button>

          </div>
        </form>

        <div className="text-center text-sm text-gray-700 border-t border-gray-300 pt-4">
           {form ? `Don't have an account`: 'Already have an account?'}
          <span onClick={() => setForm(!form)} className="text-blue-700 hover:underline cursor-pointer ml-1">
            {form ? 'Signup':'Login'}</span>
        </div>
      </div>
    </div>
   
   </>
  );
};

export default FormPage;
