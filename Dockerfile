FROM ubuntu:bionic

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y cron bash curl

ENV NODE_VERSION=10.16.2
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN echo "NODE Version:" && node --version
RUN echo "NPM Version:" && npm --version

WORKDIR /explorer

RUN npm cache clean --force
RUN npm install -g yarn node-gyp
#RUN yarn global add webpack-dev-server
#RUN yarn global add webpack
#RUN yarn global add webpack-cli

COPY package.json /explorer

RUN yarn install --ignore-engines
#COPY docker/node/install.sh /root/install.sh
#COPY docker/node/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY . .

ADD crontab /etc/cron.d/hello-cron
RUN chmod 0644 /etc/cron.d/hello-cron
RUN crontab /etc/cron.d/hello-cron
RUN touch /var/log/cron.log

EXPOSE 8087
EXPOSE 8081

CMD ["script/start.sh"]