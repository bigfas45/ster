import { registerApplication, start, navigateToUrl } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";

let templateRouteCode = "";

const data: any = {
  loaders: {
    loading: `<style>*{margin: 0; padding: 0; box-sizing: border-box;}main{height: calc(100vh - 100px);}.container{height: 100%; padding: 32px;}.nav-loader{height: 60px;}.nav-loader ul{margin: 0 32px; list-style: none; border-bottom: .1px solid rgba(201,201,201,0);}.nav{width: 12%; padding: 30px 20px; position: relative; overflow: hidden;}.nav::before{content: ""; width: 50px; height: 300%; position: absolute; left: 0; top: -100%; animation: loader-nav 4s linear infinite; background: linear-gradient(90deg, rgba(185, 181, 181, 0.3), rgba(185, 181, 181, 0.538), rgba(185, 181, 181, 0.3)); transform: rotate(45deg);}.content-container{display: grid; grid-template-columns: 1fr 2fr; grid-column-gap: 4%; width: 100%; height: calc(100% - 60px); padding: 32px;}.content{width: 100%; height: 100%; background: #fff; border-radius: 0.625rem; overflow: hidden; position: relative;}.content::before{position: absolute; content: ""; top: -50%; left: 0; width: 100px; height: 300%; background: linear-gradient(90deg, rgba(185, 181, 181, 0.3), rgba(185, 181, 181, 0.538), rgba(185, 181, 181, 0.3)); animation: loader-body 4s linear infinite; transform: rotate(45deg);}@keyframes loader-nav{0%{left: -50%; opacity: 0.5;}50%{left: 100%; opacity: 0.2;}100%{left: -100%; opacity: 0.5;}}@keyframes loader-body{0%{left: -50%; opacity: 0.5;}50%{left: 100%; opacity: 0.2;}100%{left: -100%; opacity: 0.5;}}/* media query for mobile */ @media screen and (max-width: 768px){.content-container{grid-template-columns: 1fr;}}</style> <main> <section class="container"> <div class="nav-loader"> <ul> <li class="nav"> </li></ul> </div><div class="content-container"> <div class="content"> </div><div class="content"> </div></div></section> </main>`,
    home: `<style>*{margin: 0; padding: 0; box-sizing: border-box;}main{height: 100vh; background: rgba(243,243,243,0);}.container{height: 100%; padding: 32px;}.nav-loader{height: 60px;}.nav-loader ul{/* margin: 0 32px; */ list-style: none; border-bottom: .1px solid rgba(201,201,201,0);}.nav{width: 12%; padding: 30px 20px; position: relative; overflow: hidden;}.nav::before{content: ""; width: 10%; height: 300%; position: absolute; left: 0; top: -100%; animation: loader-nav 4s linear infinite; background: linear-gradient(90deg, rgba(185, 181, 181, 0.3), rgba(185, 181, 181, 0.538), rgba(185, 181, 181, 0.3)); transform: rotate(45deg);}.content-container{display: grid; grid-template-columns: 1fr 1fr 1fr; grid-gap: 4%; height: 100%; /* padding: 32px; */}.content{width: 100%; height: 100%; background: #fff; border-radius: 0.625rem; margin-top: 1.875rem; overflow: hidden; position: relative;}.content::before{position: absolute; content: ""; top: -50%; left: 0; width: 10%; height: 300%; background: linear-gradient(90deg, rgba(185, 181, 181, 0.3), rgba(185, 181, 181, 0.538), rgba(185, 181, 181, 0.3)); animation: loader-body 4s linear infinite; transform: rotate(45deg);}@keyframes loader-nav{0%{left: -50%; opacity: 0.5;}50%{left: 100%; opacity: 0.2;}100%{left: -100%; opacity: 0.5;}}@keyframes loader-body{0%{left: -50%; opacity: 0.5;}50%{left: 100%; opacity: 0.2;}100%{left: -100%; opacity: 0.5;}}/* media query for mobile */ @media screen and (max-width: 768px){.content-container{grid-template-columns: 1fr 1fr;}.content{height: 300px;}}@media screen and (max-width: 480px){.content-container{grid-template-columns: 1fr;}.content{height: 300px;}}</style> <main> <section class="container"> <div class="nav-loader" nav> <ul> <li class="nav"> </li></ul> </div><div class="content-container"> <div class="content"> </div><div class="content"> </div><div class="content"></div><div class="content"></div><div class="content"></div><div class="content"></div></div></section> </main>`,
  },
};

async function loadApplications() {
  const applicationList = JSON.parse(localStorage.getItem("ApplicationList"));

  await applicationList.forEach((app, index) => {
    if (app.result.appRoute) {
      const routeCode = `<route path="${app.result.appRoute}">
        <application loader="${
          app.result.appName === "@stanbic/home" ? "home" : "loading"
        }" name="${app.result.appName}"></application>
      </route>
      `;
      templateRouteCode += routeCode;
    }
  });
}

function startApplication() {
  const routes = constructRoutes(
    `
  <single-spa-router>
    <redirect from="/" to="/auth"></redirect>
    <main class="stanbicMain" id="stanbicMain">
      <div class="sideBar">
        <application name="@stanbic/sidebar"></application>
      </div>
      <div class="stanbicBaseApplicationMainContainer">
        <div class="header">
          <application name="@stanbic/header"></application>
        </div>
        <div class="stanbicBaseApplicationMain">` +
      templateRouteCode +
      `</div>
      </div>
    </main>
  </single-spa-router>
  `,
    data
  );

  const applications = constructApplications({
    routes,
    loadApp({ name }) {
      return System.import(name);
    },
  });
  const layoutEngine = constructLayoutEngine({ routes, applications });

  applications.forEach(registerApplication);
  layoutEngine.activate();
  start();

  window.addEventListener("single-spa:before-routing-event", (evt: any) => {
    const userId = localStorage.getItem("userId");
    const authData = localStorage.getItem("authData");

    // if (userId === null || authData === null) {
    //   navigateToUrl("/auth");
    // }

    const stanbicMain = document.querySelector("#stanbicMain") as HTMLElement;

    if (evt.detail.newUrl.includes("/auth")) {
      stanbicMain.classList.add("fullDisplayMode");
    } else {
      stanbicMain.classList.remove("fullDisplayMode");
    }
  });
}

loadApplications().then(() => {
  startApplication();
});
