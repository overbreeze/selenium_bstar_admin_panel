FROM ubuntu:18.04

ARG PORT
ARG APIC_HOSTNAME
ARG TZ
ARG NODE_ENV
ARG CRYPTO_KEY
ARG CRYPTO_IV
ARG ARTAJASA_USERNAME
ARG ARTAJASA_PASSWORD
ARG APP_TIMEOUT
ARG APIC_TOKEN_HOSTNAME

ENV PORT=${PORT}
ENV APIC_HOSTNAME=${APIC_HOSTNAME}
ENV TZ=${TZ}
ENV NODE_ENV=${NODE_ENV}
ENV CRYPTO_KEY=${CRYPTO_KEY}
ENV CRYPTO_IV=${CRYPTO_IV}
ENV ARTAJASA_USERNAME=${ARTAJASA_USERNAME}
ENV ARTAJASA_PASSWORD=${ARTAJASA_PASSWORD}
ENV APP_TIMEOUT=${APP_TIMEOUT}
ENV APIC_TOKEN_HOSTNAME=${APIC_TOKEN_HOSTNAME}

RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y build-essential
RUN apt-get install -y curl
RUN apt-get install -y rpm alien libaio1 unixodbc vim
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
RUN mkdir -p /home/app
COPY package.json ./
RUN npm i --production
RUN npm i pm2@latest -g
RUN npm install -g babel-cli
RUN pm2 install pm2-logrotate
WORKDIR /home/app
COPY . /home/app
# RUN alien -i /home/app/libclient/oracle-instantclient19.3-basic-19.3.0.0.0-1.x86_64.rpm
# RUN export LD_LIBRARY_PATH=/user/lib/oracle/19.3/client64/lib
EXPOSE ${PORT}
RUN npm run-script build
CMD ["pm2-runtime", "process.yml"]
