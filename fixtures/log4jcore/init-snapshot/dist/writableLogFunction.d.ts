/// <reference types="node" />
import { Writable } from 'stream';
export default function writableLogFunction(writable: Writable): (...args: any[]) => any;
