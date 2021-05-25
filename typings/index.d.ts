
export = App;
export as namespace app;

declare namespace App {
  type User = {
    username: string
    password: string
    twofa_tmp_secret: string
    twofa_enabled: boolean
  }
}
