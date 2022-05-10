import { registerApplication, start, navigateToUrl } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import Dexie from "dexie";

let templateRouteCode = "";

async function loadApplications() {
  var db: any = new Dexie("ApplicationList");
  let payload;
  db.version(1).stores({
    appList: `
      appName,
      appURL,
      appRoute,
      appMenuName`,
  });

  await db
    .table("appList")
    .toArray()
    .then((res) => {
      payload = res;
    });

  await payload.forEach((app, index) => {
    if (app.appRoute) {
      const routeCode = `<route path="${app.appRoute}">
        <application name="${app.appName}"></application>
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
  `
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
    var db: any = new Dexie("UserData");
    db.version(1).stores({
      userToken: 'token',
      userDetails: 'FirstName',
    });

    db.table("userToken").toArray().then((res: any) => {
      if (res.length > 0) {

      } else {
        navigateToUrl('/auth')
      }

    })
    
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
