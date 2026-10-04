FROM node:20-alpine AS build
WORKDIR /srv
COPY frontend/package.json frontend/package-lock.json frontend/.npmrc frontend/
RUN cd frontend && npm ci
COPY frontend frontend
COPY --chmod=a+rX data data
ARG VITE_BACKEND_URL=http://localhost:8000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN cd frontend && npm run build

FROM nginx:1.27-alpine
COPY --from=build /srv/frontend/dist /usr/share/nginx/html
EXPOSE 80
