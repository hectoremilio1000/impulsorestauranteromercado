COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

