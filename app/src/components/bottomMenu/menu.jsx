import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
// Removidos RestoreIcon, FavoriteIcon, LocationOnIcon se não forem usados
import { Link } from "react-router-dom";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import FaceIcon from '@mui/icons-material/Face';

// Importa o caminho do SVG como uma URL de imagem.
// Isso evita o erro de parsing do SVG como um componente, mas o SVG não herdará a cor via 'currentColor'.
import ArarinhaSrc from '/Ararinha.svg';


export default function SimpleBottomNavigation() {
  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999 }}> {/* Ajustes para mobile e zIndex */}
      <BottomNavigation
        showLabels // Este prop é para o BottomNavigation e está correto aqui. O aviso é do React sobre passar para um elemento DOM nativo, mas o MUI o gerencia.
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        className="!bg-black/60 backdrop-blur-xl text-white m-2 rounded-2xl" 
        sx={{
          "& .MuiBottomNavigationAction-root": {
            color: 'rgba(255, 255, 255, 0.7)', 
          },
          "& .Mui-selected": {
            color: '#00a8c6',
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: '0.75rem',
          },
          "& .MuiBottomNavigationAction-root img": {
            width: '24px',
            height: '24px',
          }
        }}
      >
        <Link to="/">
          <BottomNavigationAction label="Home" icon={<HomeFilledIcon />} />
        </Link>
        <Link to="/finances"> {/* Assumindo que "Favorites" era para Finanças */}
          <BottomNavigationAction label="Finanças" icon={<AccountBalanceWalletIcon />} />
        </Link>
         <Link to="/ararinha-bot"> {/* Crie uma rota para a página da Ararinha se necessário */}
          {/* Usando o SVG como uma imagem padrão para evitar o erro de parsing */}
          <BottomNavigationAction label="Ararinha" icon={<img src={ArarinhaSrc} alt="Ararinha Icon" style={{ width: '24px', height: '24px' }} />} />
        </Link>
        <Link to="/statistics"> {/* Assumindo que "Contact" era para Estatísticas */}
          <BottomNavigationAction label="Estatísticas" icon={<EqualizerIcon />} />
        </Link>
         <Link to="/profile"> {/* Assumindo que "Profile" é para o Perfil */}
          <BottomNavigationAction label="Perfil" icon={<FaceIcon />} />
        </Link>
      </BottomNavigation>
    </Box>
  );
}
