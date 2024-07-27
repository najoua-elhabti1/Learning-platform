# Stage 1: Build
FROM node:16 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/learning_app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
