import React from 'react'
import { codeToIcon } from '../lib/weather'
export default function WIcon({code}){ return <span className='icon'>{codeToIcon(code)}</span> }
