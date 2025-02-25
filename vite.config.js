/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const {GOOGLE_MAPS_API_KEY = ''} = loadEnv(mode, process.cwd(), '');
  const {IPINFO_TOKEN = ''} = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(GOOGLE_MAPS_API_KEY),
      'process.env.IPINFO_TOKEN': JSON.stringify(IPINFO_TOKEN)
    },
    base: '/fiba3x3map/',
    resolve: {
      alias: {
        '@vis.gl/react-google-maps/examples.js':
          'https://visgl.github.io/react-google-maps/scripts/examples.js'
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://play.fiba3x3.com/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/ipinfo': {
          target: 'https://ipinfo.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ipinfo/, '')
        }
      }
    }
  };
});
