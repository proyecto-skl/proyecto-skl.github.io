import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');

/* --- MODO DORADO LEADERBOARD --- */
body.gold-theme {
    /* Cambia el fondo por el nuevo asset */
    background-image: url('../assets/bg2_gd.png') !important;
    background-color: #1a1500; /* Color de seguridad oscuro */
    background-attachment: fixed;
    background-size: cover;
}

/* Aplicar el degradado dorado a los contenedores principales */
body.gold-theme .page-leaderboard-container {
    background: linear-gradient(180deg, #ffd800 0%, #ff7e00 100%) !important;
    min-height: 100vh;
}

/* Ajustes para que las tablas y textos resalten sobre el dorado */
body.gold-theme .board, 
body.gold-theme .player {
    background-color: rgba(0, 0, 0, 0.75) !important; /* Fondo oscuro semi-transparente */
    border: 2px solid #ffd800;
    box-shadow: 0 0 20px rgba(255, 216, 0, 0.3);
}

/* Color de los textos de títulos */
body.gold-theme h1, 
body.gold-theme h2, 
body.gold-theme h3 {
    color: #ffd800 !important;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* El botón seleccionado en la lista */
body.gold-theme .board .user.active button {
    background-color: #ffd800 !important;
}

body.gold-theme .board .user.active span {
    color: #000 !important; /* Texto negro sobre botón dorado */
}
