# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Config custom per React Router (evita 404 al refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]