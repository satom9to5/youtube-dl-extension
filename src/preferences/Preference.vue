<template>
  <div class="main">
    <section>
      <h2>Load & Save Json</h2>
      <div>
        Load Json: <input type="file" v-on:change="loadJson" />
      </div>

      <div>
        Save Json: <input type="button" id="save_json" value="Save Json" v-on:click="saveJson" /> 
      </div>
    </section>

    <section>
      <h2>Config</h2>
      
      <section>
        <h3>Worker Config</h3>
  
        <div>
          Sqlite Path: <input
            type="text"
            name="sqlite_path"
            id="sqlite_path"
            v-model="input.sqlite_path"
           /> 
        </div>
        <div>
          Pidfile Path: <input
            type="text"
            name="pidfile_path"
            id="pidfile_path"
            v-model="input.pidfile_path"
          /> 
        </div>
        <div>
          youtube-dl Path: <input
            type="text"
            name="youtubedl_path"
            id="youtubedl_path"
            v-model="input.youtubedl_path"
          />
        </div>
        <div>
          youtube-dl Parameter: <input
            type="text"
            name="youtubedl_parameter"
            id="youtubedl_parameter"
            v-model="input.youtubedl_parameter"
          />
        </div>
        <div>
          ffmpeg Path: <input
            type="text"
            name="ffmpeg_path"
            id="ffmpeg_path"
            v-model="input.ffmpeg_path"
          />
        </div>
        <div>
          Output Directory: <input
            type="text"
            name="output_directory"
            id="output_directory"
            v-model="input.output_directory"
          />
        </div>
        <div>
          Log Directory: <input
            type="text"
            name="log_directory"
            id="log_directory"
            v-model="input.log_directory"
          />
        </div>
        <div>
          Dev Mode: <input
            type="checkbox"
            name="dev"
            id="dev"
            v-model="input.dev"
          /> 
        </div>
      </section> 
  
      <section>
        <h3>Output Format</h3>
  
        <div>
          <input
            type="text"
            name="output_format"
            id="output_format"
            v-model="input.output_format"
          /> 
        </div>

        <h4></h4>
          Enable tags
        <ul>
          <li>[id]: Video identifier</li>
          <li>[title]: Video title</li>
          <li>[ext]: Video filename extension</li>
          <li>[author]: Full name of video uploader</li>
          <li>[width]: Width of video</li>
          <li>[height]: Height of video</li>
          <li>[resolution]: Width and height description</li>
        </ul>
        Example: <span class="example">[id]_[title]_[ext]</span><br />
      </section>

      <section>
        <h3>Media Config</h3>
  
        <div>
          Priority Container: <input type="text" name="prioty_config.containers" id="prioty_config.containers" /> 
        </div>
        <div>
          Priority Order: <input type="text" name="prioty_config.order" id="prioty_config.order" /> 
        </div>
      </section>
      <input type="button" id="save_config" value="Save" v-on:click="saveConfig" />
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import storage from 'chromeLibs/storage'

export default Vue.extend({
  name: 'Preference',

  components: {},

  data(): any {
    return {
      input: {
        sqlite_path: null,
        pidfile_path: null,
        youtubedl_path: null,
        youtubedl_parameter: null,
        ffmpeg_path: null,
        output_directory: null,
        log_directory: null,
        dev: false,
        output_format: null,
      }
    }
  },
  
  async created() {
    this.loadConfig()
  },

  methods: {
    async loadConfig() {
      const preference: Preference = await storage.get('preference')

      if (!preference) {
        return
      }

      this.input.sqlite_path = preference.sqlite_path
      this.input.pidfile_path = preference.pidfile_path
      this.input.youtubedl_path = preference.youtubedl_path
      this.input.youtubedl_parameter = preference.youtubedl_parameter
      this.input.ffmpeg_path = preference.ffmpeg_path
      this.input.output_directory = preference.output_directory
      this.input.log_directory = preference.log_directory
      this.input.dev = preference.dev
      this.input.output_format = preference.output_format
    },

    loadJson(e: Event) {
      if (!(e.target instanceof HTMLInputElement)) {
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result != "string") {
          return
        } 

        const jsonData: Preference = JSON.parse(reader.result)
        storage.setByKey('preference', jsonData).then(() => {
          this.loadConfig()
        })
      }

      if (e.target.files && e.target.files.length > 0) {
        reader.readAsText(e.target!.files[0])
      }
    },
    
    async saveJson() {
      this.saveConfig()
      const preference: Preference = await storage.get('preference')

      const blob = new Blob([ JSON.stringify(preference) ], { type: 'application/json' })

      chrome.downloads.download({
        saveAs: true,
        url: window.URL.createObjectURL(blob),
        filename: 'youtube-dl-extension.json'
      })
    },

    async saveConfig() {
      const preference: Preference = {...this.input}

      await storage.setByKey('preference', preference)
    }
  }
});
</script>

<style scoped>
input {
  min-width: 500px;
}

.example {
  font-weight: bold;
}
</style>
