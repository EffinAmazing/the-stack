import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  domain = new FormControl("", [
    Validators.pattern(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/i
    )
  ]);
  outsideData: {
    title: string,
    subtitle: string,
    heroImage: string,
    abilities: Array<{ title: string, icon: string, description: string }>,
    footerTitle: string,
    formLinkTitle: string,
  } | null = null;
  defaultRepeater: Array<{ title: string, icon: string, description: string }> = [];
  hasError = false;

  constructor(private router: Router) {
    // console.log(' test ');
    window["dataLayer"] = window["dataLayer"] || [];
    if (window["outsideData"]) {
      this.outsideData = window["outsideData"];

      // console.log(' *** this.defaultRepeater *** ', this.defaultRepeater);
    }

    this.defaultRepeater.push({
      title: "Manage your existing stack",
      icon: this.getAssetsFolder() + "assets/images/default-icon.png",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    });

    this.defaultRepeater.push({
      title: "Manage your existing stack",
      icon: this.getAssetsFolder() + "assets/images/default-icon.png",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    });

    this.defaultRepeater.push({
      title: "Manage your existing stack",
      icon: this.getAssetsFolder() + "assets/images/default-icon.png",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    });

    this.defaultRepeater.push({
      title: "Manage your existing stack",
      icon: this.getAssetsFolder() + "assets/images/default-icon.png",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    });

    if (this.outsideData) {
      this.defaultRepeater = this.outsideData.abilities;
    }
  }

  ngOnInit(): void {
    let content = document.querySelector(
      "#content_hidden_for_replace"
    ) as HTMLDivElement;

    if (content) {
      content.style.display = "block";
      document.querySelector("#ng_insert_content").append(content);
    }
  }

  submitDomain() {
    if (!this.domain.invalid) {
      window["dataLayer"].push({
        event: "stackbuilder.domainInput",
        domain: this.domain.value
      });
      this.router.navigateByUrl("/stack/build?domain=" + this.domain.value);
    } else {
      this.hasError = true;
    }
  }

  getHeroImageUrl() {
    if (this.outsideData) {
      return this.outsideData.heroImage;
    } else {
      return this.getAssetsFolder() + "assets/images/screen-stack.png";
    }
  }

  handleInput(data) {
    let value = data.target.value;
    if (value) {
      value = value.replace("https://", "");
      value = value.replace("http://", "");
      const arr = value.split("/");
      value = arr[0].toLowerCase();
      data.target.value = value;
      this.domain.setValue(value);
    }
  }

  public getAssetsFolder() {
    if (typeof window["assets"] !== "undefined") {
      return window["assets"];
    } else {
      return "/";
    }
  }
}
