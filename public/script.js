Vue.component("search-goods", {
  template:
    '<input class=search type="text" @input="searchHandler" placeholder="Поиск Товаров" v-model="search">',
  data() {
    return {
      search: "",
    };
  },
  methods: {
    searchHandler() {
      this.$emit("sear", this.search);
    },
  },
});
//создание карточки товаров
Vue.component("goods-item", {
  template: `<div class="goods-item" v-bind:data-id="item.id">
			<div class="item__img">
				<img v-bind:src="item.img" />
			</div>
			<h3 class="item__title">{{ item.title }}</h3>
			<p class="item__price">{{ item.price }}</p>
			<slot></slot>
		</div>`,
  props: ["item"],
  methods: {
    delGoodCart(id) {
      this.$emit("del", id);
    },
  },
});

// Товары корзины
Vue.component("cart", {
  template: `<div class="cart">
		<goods-item v-for="good in filteredgoods" v-bind:item="good">
			<label>
				Количество: <input class="item_quantity" type="text" v-model="good.quantity"
				@keydown="checkSymbol"
				@change="changeQuantityGoodCart(good)"/>
			</label>
			<button class="item__button" @click="delGoodCart(good)">
				Удалить товар
			</button>
		</goods-item>
	</div>`,
  props: ["filteredgoods"],
  methods: {
    delGoodCart(good) {
      this.$emit("del", good);
    },
    changeQuantityGoodCart(good) {
      if (good.quantity === "") good.quantity = "0";
      this.$emit("cqgc", good);
    },
    checkSymbol(e) {
      console.log(e.keyCode);
      if (
        !(
          (e.keyCode >= 48 && e.keyCode <= 57) ||
          e.keyCode == 8 ||
          (e.keyCode >= 37 && e.keyCode <= 40) ||
          e.keyCode == 46
        )
      )
        e.returnValue = false;
    },
  },
});
// Ошибки
Vue.component("error", {
  template: '<h1 class="message">{{ mesUpper }}</h1>',
  data() {
    return {
      mes: "the request to the server cannot be executed",
    };
  },
  computed: {
    mesUpper() {
      return this.mes.toUpperCase();
    },
  },
});

var app = new Vue({
  el: "#app",
  data: {
    goods: [],
    filteredGoods: [],
    search: "",
    message: "",
    isVisibleCart: false,
    isError: false,
    cartGoods: [],
  },
  computed: {
    messageUpper() {
      return this.message.toUpperCase();
    },
  },
  methods: {
    onFetchSuccess(data) {
      if (data.length != 0) {
        this.goods = data;
        this.filteredGoods = this.goods;
      }
			this.setMessage();
    },

    onFetchError(err) {
      this.message = err;
      this.isError = true;
    },
//вывод сообщений
		setMessage() {
			if (this.isVisibleCart) {
				if(this.cartGoods.length === 0) {
					this.message = 'в корзине отсутствуют товары';
				} else {
					if(this.filteredGoods.length === 0) {
						this.message = 'the list of filtered goods is empty';
					} else {
						this.message = 'Ваша корзина';
					}
				}
			} else {
				if(this.goods.length === 0) {
					this.message = 'the list of goods is empty';
				} else {
					if(this.filteredGoods.length === 0) {
						this.message = 'the list of filtered goods is empty';
					} else {
						this.message = 'Добавьте товары в корзину';
					}
				}
			}
		},

    searchHandler(search) {
      this.search = search;
      let arrGoods = this.isVisibleCart ? this.cartGoods : this.goods;

      if (this.search === "") {
        this.filteredGoods = arrGoods;
      }
      const regexp = new RegExp(this.search, "i");
      this.filteredGoods = arrGoods.filter((good) => regexp.test(good.title));
      this.setMessage();
    },

    visibleCart() {
      this.isVisibleCart = !this.isVisibleCart;
			this.filteredGoods = (this.isVisibleCart) ? this.cartGoods : this.goods;
			this.setMessage();
    },

    addGoodCart(good) {
      fetch("/cartAdd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...good,
          quantity: 1,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.cartGoods = data;
        })
        .catch(this.onFetchError.bind(this));
    },

    delGoodCart(good) {
      fetch("/cartDel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(good),
      })
        .then((response) => response.json())
        .then((data) => {
          this.cartGoods = data;
          this.filteredGoods = this.cartGoods;
					this.setMessage();
          // if (this.cartGoods.length === 0)
          //   this.message = "the shopping cart is empty";
        })
        .catch(this.onFetchError.bind(this));
    },

    changeQuantityGoodCart(good) {
      fetch("/cartChangeQuantity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(good),
      });
    },

    sumCart() {
      return this.cartGoods.reduce((acc, item) => acc + item.price, 0);
    },
  },
  mounted() {
    fetch("/data")
      .then((response) => response.json()) // вытащить тело ответа с сервера
      .then(this.onFetchSuccess.bind(this))
      .catch(this.onFetchError.bind(this));

    fetch("/cart")
      .then((response) => response.json())
      .then((data) => {
        this.cartGoods = data;
      })
      .catch(this.onFetchError.bind(this));
  },
});
