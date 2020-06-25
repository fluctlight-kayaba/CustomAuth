import { LOGIN_TYPE } from "../utils/enums";
import { get } from "../utils/httpHelpers";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

export default class RedditHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "identity";

  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    readonly redirectToOpener?: boolean
  ) {
    super(clientId, verifier, redirect_uri, redirectToOpener);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL(`https://www.reddit.com/api/v1/authorize${window.innerWidth < 600 ? ".compact" : ""}`);
    finalUrl.searchParams.append("response_type", this.RESPONSE_TYPE);
    finalUrl.searchParams.append("client_id", this.clientId);
    finalUrl.searchParams.append("state", this.state);
    finalUrl.searchParams.append("scope", this.SCOPE);
    finalUrl.searchParams.append("redirect_uri", this.redirect_uri);
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { accessToken } = params;
    const userInfo = await get<{ icon_img: string; name: string }>("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { icon_img: profileImage = "", name = "" } = userInfo;
    return {
      email: "",
      name,
      profileImage: profileImage.split("?").length > 0 ? profileImage.split("?")[0] : profileImage,
      verifier: this.verifier,
      verifierId: name.toLowerCase(),
      typeOfLogin: this.typeOfLogin,
    };
  }
}
