FROM node:12.22.7-alpine as build

WORKDIR /app

COPY ./build ./build

# ---
FROM nginx:1.20.1-alpine

WORKDIR /etc/nginx
ADD nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]