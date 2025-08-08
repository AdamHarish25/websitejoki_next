'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

export function RefreshingLink({ clicked = () => {}, ...props }) {
  const handleClick = (e) => {
    e.preventDefault();
    clicked();
    window.location.href = props.href; // Force full page reload
  };

  return (
    <Link {...props} onClick={handleClick}>
      {props.children}
    </Link>
  );
}