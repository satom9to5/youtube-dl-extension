<template>
  <div class="main">
    <h1>Select Formats</h1>

    <div v-if="loading">
      Now Loading...
    </div>

    <div v-if="!loading && formats.length == 0">
      Not Found Video Formats. (from Vue)
    </div>

    <ul v-if="!loading && formats.length > 0">
      <li class="format" style="margin-bottom: 20px;">
        <a href="#" v-on:click="queueMaxPriorityFormat">
          Max Priorty Format
        </a>
      </li>

      <li v-for="(format, index) in formats" :key="index" class="format">
        <a href="#" v-on:click="queueFormat(index)">
          {{ format.container }} {{ format.qualityLabel }} {{ format.formatType }} 
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import ytdl from 'ytdl-core'

import { getInfo, getMaxPriorityFormat, createVideoAudioFormat } from 'common/youtubeFormat'
import workerRequest from 'common/workerRequest'
import { getCurrentTab } from 'common/tabs'
import { isWatchPage } from 'common/url'

export default Vue.extend({
  name: 'Popup',

  components: {},

  data(): any {
    return {
      videoInfo: null,
      formats: [],
      loading: true,
    }
  },
  
  async created() {
    const currentTab: chrome.tabs.Tab = await getCurrentTab();

    if (!currentTab.url || !isWatchPage(currentTab.url)) {
      this.loading = false
      return
    }

    this.videoInfo = await getInfo(currentTab.url)
    if (this.videoInfo instanceof Error) {
      this.loading = false
      return
    }
    //console.log(this.videoInfo)

    this.formats = this.videoInfo.formats.map((format: ytdl.videoFormat) => {
      return {...format, formatType: this.getFormatType(format)}
    })
    this.loading = false
  },

  methods: {
    getFormatType(format: ytdl.videoFormat): string {
      if (format.qualityLabel) {
        return format.audioQuality ? 'video & audio' : 'video only (with audio download)'
      } else {
        return 'audio only'
      }
    },
    async queueMaxPriorityFormat() {
      const maxPriorityFormat = await getMaxPriorityFormat(this.videoInfo)
      if (maxPriorityFormat.videoFormat == null) {
        return
      }

      await workerRequest.addQueue(maxPriorityFormat, this.videoInfo)
    },    
    async queueFormat(index: number) {
      //console.log(this.formats[index])
      if (this.formats[index].bitrate == null) {
        return
      }

      const videoAudioFormat: VideoAudioFormat = await createVideoAudioFormat(this.formats[index], this.videoInfo)

      await workerRequest.addQueue(videoAudioFormat, this.videoInfo)
    }
  }
});
</script>

<style scoped>
div.main {
  min-width: 400px;
}

li {
  list-style: none;
}

li.format {
  border: medium solid #000000;
  margin: 10px 0 10px 0;
  padding: 5px 0 5px 0;
  background-color: #ff8c00;
}
</style>
