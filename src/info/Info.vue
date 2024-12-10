<template>
  <div class="main">
    <h2>Queued Tasks</h2>

    <ul>
      <li v-for="(task, index) in tasks" :key="index" class="format">
        <a :href="task.url" target="_blank" rel="noopener noreferrer">
          {{ task.title }} (<span>{{ task.video_format }}p</span><span v-show="task.audio_format != ''"> x {{ task.audio_format }}p</span>)
        </a>
        <a href="#" v-on:click="removeQueue(task.id)">Remove</a>
        <p>
          Output Path: {{ task.output_directory }}/{{ task.filename }}
          Created At: {{ task.created_at }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import tabs from 'chromeLibs/tabs'

import workerRequest from 'common/workerRequest'

export default Vue.extend({
  name: 'Info',

  components: {},

  data(): any {
    return {
      tasks: [],
      failedTasks: [],
    }
  },
  
  async created() {
    this.tasks = await workerRequest.getTasks()
  },

  methods: {
    async removeQueue(id: string) {
      await workerRequest.removeQueue(id)
      this.tasks = await workerRequest.getTasks()
    }
  }
});
</script>

<style scoped>
li {
  list-style: none;
}

li.format {
  padding: 5px 0 5px 0;
}
</style>
