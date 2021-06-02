import { Component, h } from 'preact';
import { Router, route } from 'preact-router';
import Expense from '../routes/expenses';
import Sales from '../routes/sales';
import AppContainer from './app-container';
import Header from './header';
import NavBar from './nav-bar';
import PopUpDialog from './pop-up-dialog';
import Users from '../routes/users';
import Loading from './loading-C';
import AllSoldProductsDoneByUser from '../routes/all-sold-goods-by-user';
import AddNewSale from '../routes/addNewSale';
import Products from '../routes/products';
import Stock from '../routes/stock';
import AddNewProductInStock from '../routes/add-new-product-in-stock';
import Login from '../routes/login';
import { AppDB } from '../db';
import UsersModel from '../models/users';
import Dashboard from '../routes/dashboard';
import PurchaseLogs from '../routes/purchase-logs';
import AddEditUserComponent from '../routes/add-edit-user';
import RemoveFromStock from '../routes/remove-from-stock';
import LoansList from '../routes/loans-list';
import CustomerLoanInfo from '../routes/customer-loan-detail/index';
import AddNewLoan from '../routes/add-new-loan';
import CircularLoading from './circular-loadding';
import CreateAccount from '../routes/create-account';
import SpecificProductLogInStock from '../routes/stock-product-logs';
import FullScreenLoading from './full-screen-loading';
import defineRouteDest from '../generators/routeVerifier';
import NotAuthorized from '../routes/not-authaurized';
import Report from '../routes/report';
import SiteModel from '../models/sites';
import Toast from './toast';

export default class App extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: false,
			render: "",
			user: undefined,
			rowData: undefined,
			showNav: false,
			showNotification: false,
			site: "kicukiro", 
			currentRoute: ""
		}

		this.handleRoute = this.handleRoute.bind(this)
	}

	isLoading(status) {
		this.setState({ isLoading: status });
	}

	componentDidMount() {
		const onLine = window.navigator.onLine;
		if (!onLine) Toast.create("There is no internet connection. Please check", { errorMessage: true });
		AppDB.auth().onAuthStateChanged(user => {
			if (user) {
				this.setUser(user);
				this.setState({ render: "mainApp" });
			}
			else {
				this.setState({ render: "login" });
			}
		});
	}

	async setUser(user) {
		this.setState({ isLoading: true });
		const idTokenId = await AppDB.auth().currentUser.getIdTokenResult(true);
		const claims = idTokenId.claims;
		if (!claims) return;
		let primaryId = claims.isOwner ? user.uid : claims.primaryId;
		const data = {
			uid: user.uid,
			isOwner: claims.isOwner,
			primaryId
		};
		const userData = await UsersModel.getUser(data);
		const allSites = await SiteModel.getArrayOfSitesOnly(primaryId);
		const sites = claims.isOwner ? allSites : userData.sites ? userData.sites : [];
		if (userData) {
			const fullUserData = {
				...user,
				...claims,
				...userData,
				primaryId,
				sites,
			};
			this.setState({
				user: fullUserData,
				render: "mainApp",
				isLoading: false
			});
		}

	}



	handleRoute = e => {
		const url = e.url;
		this.setState({ showNav: false , currentRoute: url})
		if (this.state.user) {
			const user = this.state.user;
			const isOwner = user.isOwner;
			const adminGroup = isOwner ? "admin" : user.administrativeGroup;
			const permissions = this.state.user.per
			if (url == "/removeFromStock") user.productsDefine == "default" ? route("/stock") : "";
			if (!isOwner) {
				const permissions = this.state.user.permittedRessources
				defineRouteDest(url, permissions, e);
			}
		}
	};

	goTo(dest) {
		this.setState({ render: "login", user: undefined });
	}

	setRowData(rowData) {
		this.setState({ rowData })
	}

	siteChanged(data){
		const site = data.site;
		const productsDefine = data.productsDefine;
		const user = this.state.user;
		this.setState({
			site,
			user: {...user, productsDefine}
		})
	}



	mainApp(props) {
		let userDocId;
		console.log(this.state.user.productsDefine);
		return (
			<>
				<FullScreenLoading visible={this.state.isLoading} />

				<Header isLoading={status => this.isLoading(status)} site={(this.state.site)} showNavInReturn={value => this.setState({ showNav: value })} showNav={(this.state.showNav)} user={this.state.user} />
				<NavBar currentRoute={(this.state.urrentRoute)} selectedSite={data => this.siteChanged(data)} showNavInReturn={value => this.setState({ showNav: value })} showNav={(this.state.showNav)} goTo={dest => this.goTo(dest)} user={this.state.user} isLoading={status => this.isLoading(status)} />
				<AppContainer>
					<Router onChange={this.handleRoute}>
						{/* <Dashboard site={(this.state.site)} default user={this.state.user} isLoading={status => this.isLoading(status)} path="/" /> */}
						<Stock site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/stock" />
						<Sales site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/sales" />
						<Expense site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/more" />
						<Products site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/products" />
						<Users site={(this.state.site)} rowData={data => this.setRowData(data)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/users" />
						<AllSoldProductsDoneByUser site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/allProductSoldByUser" />
						<AddNewSale default site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/addNewSale" />
						<AddNewProductInStock site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/addNewProductInStock" />
						<PurchaseLogs site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/stock/purchaseLogs" />
						<AddEditUserComponent site={(this.state.site)} isEdit rowData={this.state.rowData} id={userDocId} user={this.state.user} isLoading={status => this.isLoading(status)} path="users/editUser/:userDocId" />
						<AddEditUserComponent site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/users/addUser" />
						<RemoveFromStock site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/removeFromStock" />
						<LoansList site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/loans" />
						<CustomerLoanInfo site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/loans/:customerLoanId" />
						<AddNewLoan site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/addNewLoan" />
						<SpecificProductLogInStock site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/stock/:productId" />
						<NotAuthorized site={(this.state.site)} path={"/notAuthorized"} />
						<Report site={(this.state.site)} user={this.state.user} isLoading={status => this.isLoading(status)} path="/report" />
					</Router>
				</AppContainer>
				<PopUpDialog />

			</>
		)
	}





	toRender() {
		const onLine = window.navigator.onLine;
		if (!onLine) Toast.create("There is no internet connection. Please check!", {errorMessage: true});
		AppDB.auth().onAuthStateChanged(user => {
			if (user) {
				this.state.render = "mainApp";
			}
			else {
				this.state.render = "login";

				this.state.user = null;
			}
		});
		if (this.state.user === null) {
			// return <Login isLoading={status => this.isLoading(status)} path="/login" />;
			return (
				<>
					<FullScreenLoading visible={this.state.isLoading} />
					<Router >
						<CreateAccount isLoading={status => this.isLoading(status)} path="/createAccount" />
						<Login default isLoading={status => this.isLoading(status)} path="/login" />
					</Router>
				</>
			)
		}
		else if (this.state.user && this.state.render == "mainApp") {
			return this.mainApp(this.props, this.state);
		}
		else {
			return <CircularLoading />;
		}
	}

	render() {

		return (
			<div id="app">
				{this.toRender()}
			</div>
		);
	}
}
