FROM node:14.17.1 AS compile-image
WORKDIR /internetBankingTransfer
COPY package.json package-lock.json ./
RUN npm cache clean --force
RUN npm install
COPY . ./
RUN npm run build

FROM nginx
COPY --from=compile-image /internetBankingTransfer/dist/internetBankingTransfer /usr/share/nginx/html
COPY --from=compile-image /internetBankingTransfer/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
