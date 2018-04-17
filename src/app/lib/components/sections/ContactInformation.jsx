import React, { Component } from 'react';

import '../../../stylesheets/contactInfo';


export default class ContactInformation extends Component {
  render() {
    const email = 'samantha.a.douglass@gmail.com';

    return (
      <div className="contact-info">
        <div className="name">
          <span className="first">Samantha</span>
          <span className="last">Douglass</span>
        </div>
        <div className="contacts">
          <span className="address">5058 Mt. Blanc Lane, Allendale MI 49401</span>
          <a href={`mailto:${email}`}>{email}</a>
          <span className="phone">(616) 502 - 6642</span>
        </div>
      </div>
    );
  }
}
