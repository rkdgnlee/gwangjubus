interface ImportMetaEnv {
  readonly PUBLIC_API_PRIVATE_KEY: string;
  readonly API_STOP_ARRIVE_URL: string;
    readonly API_BUS_ROUTE_URL: string;
        readonly API_BUS_LOCATION_URL: string;
        readonly API_STOP_URL: string;
  // 추가 env 변수 있으면 여기에 계속 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}