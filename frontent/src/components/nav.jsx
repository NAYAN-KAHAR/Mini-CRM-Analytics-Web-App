
import { useEffect, useState, useContext, use } from "react";
import { IoMenuSharp, IoCloseSharp } from "react-icons/io5";
import { GoSignOut } from "react-icons/go";

import axios from "axios";
import { Link, useLocation,useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify';

const Navbar = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
 
    const location = useLocation();
    const navigate =  useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 639);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuToggle = () => {
        setIsMenuOpen(prev => !prev);
    };

    const handleLogOut = () => {
        console.log('cliked');
        localStorage.removeItem('user_id');
        toast.success('logout successfully');
        setTimeout(() => navigate('/'), 1000);
    }

    return (
        <>
        <div className="w-full bg-white  shadow-sm z-50 fixed top-0">
            <div className="py-3 px-2 md:px-6 flex justify-between items-center">
              <h1 className="text-black text-xl font-extrabold cursor-pointer">CRM APP</h1>
            
            {isMobile ? <div className="cursor-pointer" onClick={handleMenuToggle}>
                { isMenuOpen ? <IoCloseSharp size={25} /> : <IoMenuSharp size={25} />}
            </div>: <div className="flex items-center">
                <ul className="flex gap-6 text-sm items-center">
                    <Link to={'/dashboard'}>
                    <li className={`font-semibold text-black cursor-pointer ${
                        location.pathname === '/dashboard' ? 'text-violet-700' : ''
                        }`}>Dashboard</li>
                    </Link>

                      <Link to={'/customers'}> 
                        <li className={`font-semibold text-black cursor-pointer ${
                        location.pathname === '/customers' ? 'text-violet-700 ' : ''
                        }`}>Customers</li>
                     </Link>

                      <Link to={'/deals'}> 
                        <li className={`font-semibold text-black cursor-pointer ${
                        location.pathname === '/deals' ? 'text-violet-700 ' : ''
                        }`}>Deals</li>
                     </Link>

                    <li onClick={handleLogOut} className="text-red-600 font-semibold cursor-pointer flex gap-1 items-center">
                        <GoSignOut size={12}/> <span>Logout </span>
                    </li>
                    
                            
                </ul>
            </div> }


            </div>


          
            {isMobile && isMenuOpen ? 
             <>
             <div className="flex items-center justify-center ">
                <ul className="p-4 flex gap-6 flex-col justify-start text-sm items-start">
                     <Link to={'/dashboard'}> 
                        <li className=" font-semibold cursor-pointer"  
                        onClick={()=> setIsMenuOpen(!isMenuOpen)}>Dashboard</li>
                     </Link>

                       <Link to={'/customers'}> 
                        <li  onClick={()=> setIsMenuOpen(!isMenuOpen)}
                         className="font-semibold  text-black cursor-pointer">Customers</li>
                     </Link>

                        <Link to={'/deals'}> 
                        <li className=" font-semibold  text-black cursor-pointer" 
                        onClick={()=> setIsMenuOpen(!isMenuOpen)}>Deals</li>
                     </Link>

                        <li onClick={handleLogOut}  
                        className="text-red-600 font-semibold cursor-pointer flex gap-1 items-center">
                            <GoSignOut size={12}/> <span>Logout </span>
                            </li>
                    
                            
                </ul>
            </div>
            </>
             :''}

        </div>

         
</>
    );
};

export default Navbar;
