FROM postgres:13
# FROM postgres:latest

ENV POSTGRES_USER="postgres"
ENV POSTGRES_PASSWORD="waffentrager"
ENV POSTGRES_DB="postgres"

COPY init.sql /docker-entrypoint-initdb.d/
