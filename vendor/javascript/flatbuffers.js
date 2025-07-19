// flatbuffers@25.2.10 downloaded from https://ga.jspm.io/npm:flatbuffers@25.2.10/mjs/flatbuffers.js

const t=2;const e=4;const s=4;const i=4;const r=new Int32Array(2);const n=new Float32Array(r.buffer);const h=new Float64Array(r.buffer);const a=new Uint16Array(new Uint8Array([1,0]).buffer)[0]===1;var o;(function(t){t[t.UTF8_BYTES=1]="UTF8_BYTES";t[t.UTF16_STRING=2]="UTF16_STRING"})(o||(o={}));class ByteBuffer{constructor(t){this.bytes_=t;this.position_=0;this.text_decoder_=new TextDecoder}static allocate(t){return new ByteBuffer(new Uint8Array(t))}clear(){this.position_=0}bytes(){return this.bytes_}position(){return this.position_}setPosition(t){this.position_=t}capacity(){return this.bytes_.length}readInt8(t){return this.readUint8(t)<<24>>24}readUint8(t){return this.bytes_[t]}readInt16(t){return this.readUint16(t)<<16>>16}readUint16(t){return this.bytes_[t]|this.bytes_[t+1]<<8}readInt32(t){return this.bytes_[t]|this.bytes_[t+1]<<8|this.bytes_[t+2]<<16|this.bytes_[t+3]<<24}readUint32(t){return this.readInt32(t)>>>0}readInt64(t){return BigInt.asIntN(64,BigInt(this.readUint32(t))+(BigInt(this.readUint32(t+4))<<BigInt(32)))}readUint64(t){return BigInt.asUintN(64,BigInt(this.readUint32(t))+(BigInt(this.readUint32(t+4))<<BigInt(32)))}readFloat32(t){r[0]=this.readInt32(t);return n[0]}readFloat64(t){r[a?0:1]=this.readInt32(t);r[a?1:0]=this.readInt32(t+4);return h[0]}writeInt8(t,e){this.bytes_[t]=e}writeUint8(t,e){this.bytes_[t]=e}writeInt16(t,e){this.bytes_[t]=e;this.bytes_[t+1]=e>>8}writeUint16(t,e){this.bytes_[t]=e;this.bytes_[t+1]=e>>8}writeInt32(t,e){this.bytes_[t]=e;this.bytes_[t+1]=e>>8;this.bytes_[t+2]=e>>16;this.bytes_[t+3]=e>>24}writeUint32(t,e){this.bytes_[t]=e;this.bytes_[t+1]=e>>8;this.bytes_[t+2]=e>>16;this.bytes_[t+3]=e>>24}writeInt64(t,e){this.writeInt32(t,Number(BigInt.asIntN(32,e)));this.writeInt32(t+4,Number(BigInt.asIntN(32,e>>BigInt(32))))}writeUint64(t,e){this.writeUint32(t,Number(BigInt.asUintN(32,e)));this.writeUint32(t+4,Number(BigInt.asUintN(32,e>>BigInt(32))))}writeFloat32(t,e){n[0]=e;this.writeInt32(t,r[0])}writeFloat64(t,e){h[0]=e;this.writeInt32(t,r[a?0:1]);this.writeInt32(t+4,r[a?1:0])}getBufferIdentifier(){if(this.bytes_.length<this.position_+e+s)throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");let t="";for(let i=0;i<s;i++)t+=String.fromCharCode(this.readInt8(this.position_+e+i));return t}__offset(t,e){const s=t-this.readInt32(t);return e<this.readInt16(s)?this.readInt16(s+e):0}__union(t,e){t.bb_pos=e+this.readInt32(e);t.bb=this;return t}
/**
     * Create a JavaScript string from UTF-8 data stored inside the FlatBuffer.
     * This allocates a new string and converts to wide chars upon each access.
     *
     * To avoid the conversion to string, pass Encoding.UTF8_BYTES as the
     * "optionalEncoding" argument. This is useful for avoiding conversion when
     * the data will just be packaged back up in another FlatBuffer later on.
     *
     * @param offset
     * @param opt_encoding Defaults to UTF16_STRING
     */__string(t,s){t+=this.readInt32(t);const i=this.readInt32(t);t+=e;const r=this.bytes_.subarray(t,t+i);return s===o.UTF8_BYTES?r:this.text_decoder_.decode(r)}__union_with_string(t,e){return typeof t==="string"?this.__string(e):this.__union(t,e)}__indirect(t){return t+this.readInt32(t)}__vector(t){return t+this.readInt32(t)+e}__vector_len(t){return this.readInt32(t+this.readInt32(t))}__has_identifier(t){if(t.length!=s)throw new Error("FlatBuffers: file identifier must be length "+s);for(let i=0;i<s;i++)if(t.charCodeAt(i)!=this.readInt8(this.position()+e+i))return false;return true}createScalarList(t,e){const s=[];for(let i=0;i<e;++i){const e=t(i);e!==null&&s.push(e)}return s}
/**
     * A helper function for generating list for obj api
     * @param listAccessor function that accepts an index and return data at that index
     * @param listLength listLength
     * @param res result list
     */createObjList(t,e){const s=[];for(let i=0;i<e;++i){const e=t(i);e!==null&&s.push(e.unpack())}return s}}class Builder{constructor(t){this.minalign=1;this.vtable=null;this.vtable_in_use=0;this.isNested=false;this.object_start=0;this.vtables=[];this.vector_num_elems=0;this.force_defaults=false;this.string_maps=null;this.text_encoder=new TextEncoder;let e;e=t||1024
/**
         * @type {ByteBuffer}
         * @private
         */;this.bb=ByteBuffer.allocate(e);this.space=e}clear(){this.bb.clear();this.space=this.bb.capacity();this.minalign=1;this.vtable=null;this.vtable_in_use=0;this.isNested=false;this.object_start=0;this.vtables=[];this.vector_num_elems=0;this.force_defaults=false;this.string_maps=null}
/**
     * In order to save space, fields that are set to their default value
     * don't get serialized into the buffer. Forcing defaults provides a
     * way to manually disable this optimization.
     *
     * @param forceDefaults true always serializes default values
     */forceDefaults(t){this.force_defaults=t}dataBuffer(){return this.bb}asUint8Array(){return this.bb.bytes().subarray(this.bb.position(),this.bb.position()+this.offset())}
/**
     * Prepare to write an element of `size` after `additional_bytes` have been
     * written, e.g. if you write a string, you need to align such the int length
     * field is aligned to 4 bytes, and the string data follows it directly. If all
     * you need to do is alignment, `additional_bytes` will be 0.
     *
     * @param size This is the of the new element to write
     * @param additional_bytes The padding size
     */prep(t,e){t>this.minalign&&(this.minalign=t);const s=1+~(this.bb.capacity()-this.space+e)&t-1;while(this.space<s+t+e){const t=this.bb.capacity();this.bb=Builder.growByteBuffer(this.bb);this.space+=this.bb.capacity()-t}this.pad(s)}pad(t){for(let e=0;e<t;e++)this.bb.writeInt8(--this.space,0)}writeInt8(t){this.bb.writeInt8(this.space-=1,t)}writeInt16(t){this.bb.writeInt16(this.space-=2,t)}writeInt32(t){this.bb.writeInt32(this.space-=4,t)}writeInt64(t){this.bb.writeInt64(this.space-=8,t)}writeFloat32(t){this.bb.writeFloat32(this.space-=4,t)}writeFloat64(t){this.bb.writeFloat64(this.space-=8,t)}
/**
     * Add an `int8` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int8` to add the buffer.
     */addInt8(t){this.prep(1,0);this.writeInt8(t)}
/**
     * Add an `int16` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int16` to add the buffer.
     */addInt16(t){this.prep(2,0);this.writeInt16(t)}
/**
     * Add an `int32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int32` to add the buffer.
     */addInt32(t){this.prep(4,0);this.writeInt32(t)}
/**
     * Add an `int64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `int64` to add the buffer.
     */addInt64(t){this.prep(8,0);this.writeInt64(t)}
/**
     * Add a `float32` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float32` to add the buffer.
     */addFloat32(t){this.prep(4,0);this.writeFloat32(t)}
/**
     * Add a `float64` to the buffer, properly aligned, and grows the buffer (if necessary).
     * @param value The `float64` to add the buffer.
     */addFloat64(t){this.prep(8,0);this.writeFloat64(t)}addFieldInt8(t,e,s){if(this.force_defaults||e!=s){this.addInt8(e);this.slot(t)}}addFieldInt16(t,e,s){if(this.force_defaults||e!=s){this.addInt16(e);this.slot(t)}}addFieldInt32(t,e,s){if(this.force_defaults||e!=s){this.addInt32(e);this.slot(t)}}addFieldInt64(t,e,s){if(this.force_defaults||e!==s){this.addInt64(e);this.slot(t)}}addFieldFloat32(t,e,s){if(this.force_defaults||e!=s){this.addFloat32(e);this.slot(t)}}addFieldFloat64(t,e,s){if(this.force_defaults||e!=s){this.addFloat64(e);this.slot(t)}}addFieldOffset(t,e,s){if(this.force_defaults||e!=s){this.addOffset(e);this.slot(t)}}addFieldStruct(t,e,s){if(e!=s){this.nested(e);this.slot(t)}}nested(t){if(t!=this.offset())throw new TypeError("FlatBuffers: struct must be serialized inline.")}notNested(){if(this.isNested)throw new TypeError("FlatBuffers: object serialization must not be nested.")}slot(t){this.vtable!==null&&(this.vtable[t]=this.offset())}
/**
     * @returns Offset relative to the end of the buffer.
     */offset(){return this.bb.capacity()-this.space}
/**
     * Doubles the size of the backing ByteBuffer and copies the old data towards
     * the end of the new buffer (since we build the buffer backwards).
     *
     * @param bb The current buffer with the existing data
     * @returns A new byte buffer with the old data copied
     * to it. The data is located at the end of the buffer.
     *
     * uint8Array.set() formally takes {Array<number>|ArrayBufferView}, so to pass
     * it a uint8Array we need to suppress the type check:
     * @suppress {checkTypes}
     */static growByteBuffer(t){const e=t.capacity();if(e&3221225472)throw new Error("FlatBuffers: cannot grow buffer beyond 2 gigabytes.");const s=e<<1;const i=ByteBuffer.allocate(s);i.setPosition(s-e);i.bytes().set(t.bytes(),s-e);return i}
/**
     * Adds on offset, relative to where it will be written.
     *
     * @param offset The offset to add.
     */addOffset(t){this.prep(e,0);this.writeInt32(this.offset()-t+e)}startObject(t){this.notNested();this.vtable==null&&(this.vtable=[]);this.vtable_in_use=t;for(let e=0;e<t;e++)this.vtable[e]=0;this.isNested=true;this.object_start=this.offset()}
/**
     * Finish off writing the object that is under construction.
     *
     * @returns The offset to the object inside `dataBuffer`
     */endObject(){if(this.vtable==null||!this.isNested)throw new Error("FlatBuffers: endObject called without startObject");this.addInt32(0);const e=this.offset();let s=this.vtable_in_use-1;for(;s>=0&&this.vtable[s]==0;s--);const i=s+1;for(;s>=0;s--)this.addInt16(this.vtable[s]!=0?e-this.vtable[s]:0);const r=2;this.addInt16(e-this.object_start);const n=(i+r)*t;this.addInt16(n);let h=0;const a=this.space;t:for(s=0;s<this.vtables.length;s++){const e=this.bb.capacity()-this.vtables[s];if(n==this.bb.readInt16(e)){for(let s=t;s<n;s+=t)if(this.bb.readInt16(a+s)!=this.bb.readInt16(e+s))continue t;h=this.vtables[s];break}}if(h){this.space=this.bb.capacity()-e;this.bb.writeInt32(this.space,h-e)}else{this.vtables.push(this.offset());this.bb.writeInt32(this.bb.capacity()-e,this.offset()-e)}this.isNested=false;return e}finish(t,r,n){const h=n?i:0;if(r){const t=r;this.prep(this.minalign,e+s+h);if(t.length!=s)throw new TypeError("FlatBuffers: file identifier must be length "+s);for(let e=s-1;e>=0;e--)this.writeInt8(t.charCodeAt(e))}this.prep(this.minalign,e+h);this.addOffset(t);h&&this.addInt32(this.bb.capacity()-this.space);this.bb.setPosition(this.space)}finishSizePrefixed(t,e){this.finish(t,e,true)}requiredField(t,e){const s=this.bb.capacity()-t;const i=s-this.bb.readInt32(s);const r=e<this.bb.readInt16(i)&&this.bb.readInt16(i+e)!=0;if(!r)throw new TypeError("FlatBuffers: field "+e+" must be set")}
/**
     * Start a new array/vector of objects.  Users usually will not call
     * this directly. The FlatBuffers compiler will create a start/end
     * method for vector types in generated code.
     *
     * @param elem_size The size of each element in the array
     * @param num_elems The number of elements in the array
     * @param alignment The alignment of the array
     */startVector(t,s,i){this.notNested();this.vector_num_elems=s;this.prep(e,t*s);this.prep(i,t*s)}
/**
     * Finish off the creation of an array and all its elements. The array must be
     * created with `startVector`.
     *
     * @returns The offset at which the newly created array
     * starts.
     */endVector(){this.writeInt32(this.vector_num_elems);return this.offset()}
/**
     * Encode the string `s` in the buffer using UTF-8. If the string passed has
     * already been seen, we return the offset of the already written string
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */createSharedString(t){if(!t)return 0;this.string_maps||(this.string_maps=new Map);if(this.string_maps.has(t))return this.string_maps.get(t);const e=this.createString(t);this.string_maps.set(t,e);return e}
/**
     * Encode the string `s` in the buffer using UTF-8. If a Uint8Array is passed
     * instead of a string, it is assumed to contain valid UTF-8 encoded data.
     *
     * @param s The string to encode
     * @return The offset in the buffer where the encoded string starts
     */createString(t){if(t===null||t===void 0)return 0;let e;e=t instanceof Uint8Array?t:this.text_encoder.encode(t);this.addInt8(0);this.startVector(1,e.length,1);this.bb.setPosition(this.space-=e.length);this.bb.bytes().set(e,this.space);return this.endVector()}
/**
     * Create a byte vector.
     *
     * @param v The bytes to add
     * @returns The offset in the buffer where the byte vector starts
     */createByteVector(t){if(t===null||t===void 0)return 0;this.startVector(1,t.length,1);this.bb.setPosition(this.space-=t.length);this.bb.bytes().set(t,this.space);return this.endVector()}
/**
     * A helper function to pack an object
     *
     * @returns offset of obj
     */createObjectOffset(t){return t===null?0:typeof t==="string"?this.createString(t):t.pack(this)}
/**
     * A helper function to pack a list of object
     *
     * @returns list of offsets of each non null object
     */createObjectOffsetList(t){const e=[];for(let s=0;s<t.length;++s){const i=t[s];if(i===null)throw new TypeError("FlatBuffers: Argument for createObjectOffsetList cannot contain null.");e.push(this.createObjectOffset(i))}return e}createStructOffsetList(t,e){e(this,t.length);this.createObjectOffsetList(t.slice().reverse());return this.endVector()}}export{Builder,ByteBuffer,o as Encoding,s as FILE_IDENTIFIER_LENGTH,e as SIZEOF_INT,t as SIZEOF_SHORT,i as SIZE_PREFIX_LENGTH,n as float32,h as float64,r as int32,a as isLittleEndian};

