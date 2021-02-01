import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'mobx-react';
import { UserStore as userStore } from './stores/userStore';
import { SnackbarProvider } from 'notistack';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
	palette: {
		primary: {
			main: 'rgba(42, 66, 81, 0.95)'
		}
	}
});

const UserStore = new userStore();
const stores = {UserStore};

ReactDOM.render(
	<MuiThemeProvider theme={theme}>
		<Provider {...stores}>
			<SnackbarProvider maxSnack={3}>
				<App />
			</SnackbarProvider>
		</Provider>
	</MuiThemeProvider>,
	document.getElementById('root')
);
