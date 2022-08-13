FROM node:14.17.1 AS compile-image
WORKDIR /internetBankingBaseApplication
COPY package.json package-lock.json ./
RUN npm cache clean --force
RUN npm install
COPY . ./
RUN npm run build:webpack

FROM nginx
COPY --from=compile-image /internetBankingBaseApplication/dist /usr/share/nginx/html
COPY --from=compile-image /internetBankingBaseApplication/manifest.json /usr/share/nginx/html
COPY --from=compile-image /internetBankingBaseApplication/service-worker.js /usr/share/nginx/html
COPY --from=compile-image /internetBankingBaseApplication/images /usr/share/nginx/html
COPY --from=compile-image /internetBankingBaseApplication/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
