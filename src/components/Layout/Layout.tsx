import { Outlet } from 'react-router'
import { NavbarComponent } from '../Navbar/Navbar'

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col min-h-screen">
      <NavbarComponent />
      <div className='bg-gray-200 min-h-screen'>
      <Outlet />
      </div>
      </div>
    </div>
  )
}