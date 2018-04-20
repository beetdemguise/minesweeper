import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import '../../stylesheets/facebutton.scss';


export default function FaceButton({ died, won, onClick }) {
  const classes = classNames('face', {
    died,
    won,
  });

  return (
    <button className={classes} onClick={onClick} />
  );
}

FaceButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  died: PropTypes.bool.isRequired,
  won: PropTypes.bool.isRequired,
};
