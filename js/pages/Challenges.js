import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchChallengesList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown", admin: "user-gear", helper: "user-shield",
    dev: "code", trial: "user-lock", "owner / dev": "crown", editor: "video",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading"><Spinner></Spinner></main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list && list.length">
                    <tr v-for="([level, err], i) in list" :key="i">
                        <td class="rank"><p class="type-label-lg">#{{ i + 1 }}</p></td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || 'Error' }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="embed(level.verification)" frameborder="0" allowfullscreen></iframe>
                    <ul class="stats">
                        <li><div class="type-label-md">ID</div><p>{{ level.id }}</p></li>
                    </ul>
                    <h2>Records</h2>
                    <table class="records">
                        <tr v-for="record in level.records">
                            <td class="percent"><span>{{ record.percent }}%</span></td>
                            <td class="user"><a :href="record.link" target="_blank">{{ record.user }}</a></td>
                            <td class="hz"><p>{{ record.hz }}Hz</p></td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>Selecciona un challenge para ver detalles</p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        loading: true,
        selected: 0,
        store
    }),
    computed: {
        level() {
            // Seguridad: solo devuelve el nivel si la lista ya cargó y tiene elementos
            return (this.list && this.list.length > 0 && this.list[this.selected]) ? this.list[this.selected][0] : null;
        }
    },
    async mounted() {
        this.list = await fetchChallengesList();
        this.loading = false;
    },
    methods: { embed, score }
};