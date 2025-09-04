import React from 'react';
import { AppLogoProps, registerAppLogo } from '@kinvolk/headlamp-plugin/lib';
import { SvgIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DCLogoLight from './DC_LOGO_LIGHT.svg';
import DCLogoDark from './DC_LOGO_DARK.svg';

function DCLogoComponent(props: AppLogoProps) {
  const { className, sx } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const Logo = isDark ? DCLogoDark : DCLogoLight;

  return <SvgIcon className={className} component={Logo} viewBox="0 0 auto 32" sx={sx} />;
}

export function registerDCLogo() {
  registerAppLogo(DCLogoComponent);
}