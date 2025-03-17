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

import React from 'react';
import {createRoot} from "react-dom/client";
import "react-datepicker/dist/react-datepicker.css";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import TermsAndConditions from './TermsAndConditions';
import ContactForm from './ContactForm';
import FibaMap from './FibaMap';



const App = () => {

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  console.log("App")
  if (!apiKey) {
    throw new Error("Google Maps API key is not set in the environment variables");
  }

  return (
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<FibaMap apiKey={apiKey} />}/>
            <Route path="/fiba3x3map" element={<FibaMap apiKey={apiKey} />}/>
            <Route path="/terms" element={<TermsAndConditions/>}/>
            <Route path="/contact" element={<ContactForm/>}/>
            <Route path="*" element={<div>404 Not Found</div>}/>
          </Routes>
        </div>
      </BrowserRouter>
  );
};

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error("Could not find element with id 'app'");
}

const root = createRoot(appElement);
root.render(<App/>);

export default App;