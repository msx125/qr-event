# 베이스 이미지 노드 20
FROM node:20-alpine

# 현재 환경 값 (기본 값 개발서버)
ARG NUXT_ENV=dev
ENV NUXT_ENV=$NUXT_ENV

# 포트 및 호스트 설정
ARG NITRO_HOST=0.0.0.0
ARG NITRO_PORT=3006
ENV NITRO_HOST=$NITRO_HOST
ENV NITRO_PORT=$NITRO_PORT
EXPOSE $NITRO_PORT

# 작업 디렉토리 지정
WORKDIR /app

# 모듈 설치
COPY package.json /app
COPY pnpm-lock.yaml /app
RUN npm i -g pnpm
RUN pnpm install

# 소스코드 복사
COPY . .

# 빌드 실행
RUN pnpm run build

# 서버 실행
CMD ["node", ".output/server/index.mjs"]
#CMD ["sh", "-c", "node ./\.output/server/index.mjs"]