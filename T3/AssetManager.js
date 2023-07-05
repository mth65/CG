export let assetManager = {
    // Properties ---------------------------------
    aviao: null,
    turreta: null,
    allLoaded: false,

    // Functions ----------------------------------
    checkLoaded: function () {
      if (!this.allLoaded) {
        if (this.aviao && this.turreta) {
          this.allLoaded = true;
          loadingMessage.hide();
        }
      }
    },

    hideAll: function () {
      this.aviao.visible = this.turreta = false;
    },
};