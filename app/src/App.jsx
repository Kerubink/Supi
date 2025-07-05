import './App.css';
import SimpleBottomNavigation from './components/bottomMenu/menu.jsx';
import { Outlet } from 'react-router-dom'; 

function App() {
  return (
    <>
      <section>
        <Outlet /> 
      </section>
      <SimpleBottomNavigation />
    </>
  );
}

export default App;