import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Link } from "react-router-dom";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import FaceIcon from '@mui/icons-material/Face';

export default function SimpleBottomNavigation() {
  const [value, setValue] = React.useState(0);

  return (
    <Box sx={{ width: 500 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        className="bg-black text-white fixed bottom-0 left-0 right-0"
      >
        <Link to="/">
          <BottomNavigationAction label="Home" icon={<HomeFilledIcon />} />
        </Link>
        <Link to="About">
          <BottomNavigationAction label="Favorites" icon={<AccountBalanceWalletIcon />} />
        </Link>
        <Link to="Contact">
          <BottomNavigationAction label="Contact" icon={<EqualizerIcon />} />
        </Link>
         <Link to="Profile">
          <BottomNavigationAction label="Profile" icon={<FaceIcon />} />
        </Link>
      </BottomNavigation>
    </Box>
  );
}
