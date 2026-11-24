"""R947 source-exact, streaming B043 wrapper reconstruction (never executes donor code).

A published output requires matching source-recorded outer ZIP hashes, embedded
chunk hashes and the pinned master digest. The manifest is data, not authority.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import tempfile
import zipfile

RELEASE = "OMEGA-B043-FIELD-TO-FORM-REALITY-COMPILER"
MASTER = "OMEGA_B043_FULL_SYSTEM.zip"
MASTER_SHA256 = "76092ac1396ab5224dde6f77401ce7c76819c10a749c102950045de9bad6e4e7"
MASTER_BYTES = 2778646289
PART_COUNT = 29
MAX_MANIFEST = 131072
MAX_PART_BYTES = 128 * 1024 * 1024
MAX_CHUNK_BYTES = 96_000_000
CHUNK = 1 << 20

def _hex_digest(value: object) -> bool:
    return isinstance(value, str) and len(value) == 64 and all(c in "0123456789abcdef" for c in value)

def _sha_file(stream) -> str:
    digest=hashlib.sha256()
    stream.seek(0)
    for block in iter(lambda: stream.read(CHUNK), b""):
        digest.update(block)
    stream.seek(0)
    return digest.hexdigest()

def _assemble_parts_r947(root: Path, args: dict, safe_under, *, expected_count: int,
                         expected_sha256: str, expected_bytes: int):
    if not isinstance(args, dict) or set(args) != {"manifest", "archive_folder", "destination"}:
        raise ValueError("R947_ARGUMENT_SCHEMA_HELD")
    for key in ("manifest", "archive_folder", "destination"):
        if not isinstance(args[key], str) or not args[key] or len(args[key]) > 256:
            raise ValueError("R947_ARGUMENT_PATH_HELD")
    if not args["manifest"].endswith("OMEGA_B043_PARTITION_MANIFEST.json"):
        raise ValueError("R947_ORIGINAL_MANIFEST_REQUIRED_HELD")
    manifest_path=safe_under(root,args["manifest"],True)
    folder=safe_under(root,args["archive_folder"],False)
    destination=safe_under(root,args["destination"],False)
    if not folder.is_dir() or not destination.parent.is_dir():
        raise ValueError("R947_SOURCE_OR_DESTINATION_FOLDER_HELD")
    if destination.name != MASTER or destination.exists():
        raise ValueError("R947_DESTINATION_MUST_BE_NEW_MASTER_HELD")
    if manifest_path.stat().st_size > MAX_MANIFEST:
        raise ValueError("R947_MANIFEST_SIZE_HELD")
    raw_manifest=manifest_path.read_bytes()
    manifest=json.loads(raw_manifest)
    if not isinstance(manifest,dict) or manifest.get("build") != RELEASE:
        raise ValueError("R947_MANIFEST_BUILD_IDENTITY_HELD")
    master=manifest.get("master")
    parts=manifest.get("parts")
    if (not isinstance(master,dict) or master.get("name")!=MASTER or
        master.get("sha256")!=expected_sha256 or master.get("bytes")!=expected_bytes or
        manifest.get("part_count")!=expected_count or
        not isinstance(parts,list) or len(parts)!=expected_count or
        not _hex_digest(expected_sha256)):
        raise ValueError("R947_MASTER_SOURCE_AUTHORITY_HELD")
    declared_total=0
    for i, part in enumerate(parts,1):
        suffix=f"{i:02d}_OF_{expected_count:02d}.zip"
        expected_part=f"OMEGA_B043_FULL_SYSTEM_PART_{suffix}"
        expected_chunk=f"OMEGA_B043_FULL_SYSTEM.chunk_{i:03d}_of_{expected_count:03d}.bin"
        if (not isinstance(part,dict) or type(part.get("index")) is not int or part["index"]!=i or
            part.get("part")!=expected_part or part.get("chunk")!=expected_chunk or
            part.get("members")!=[expected_chunk] or
            part.get("part_crc")!="PASS" or
            type(part.get("part_bytes")) is not int or not 22<=part["part_bytes"]<=MAX_PART_BYTES or
            type(part.get("chunk_bytes")) is not int or not 1<=part["chunk_bytes"]<=MAX_CHUNK_BYTES or
            not _hex_digest(part.get("part_sha256")) or not _hex_digest(part.get("chunk_sha256"))):
            raise ValueError("R947_PART_SOURCE_SCHEMA_HELD")
        declared_total+=part["chunk_bytes"]
    if declared_total!=expected_bytes:
        raise ValueError("R947_DECLARED_CHUNK_TOTAL_MISMATCH_HELD")
    master_hash=hashlib.sha256()
    written=0
    witnesses=[]
    temp_path=None
    try:
        with tempfile.NamedTemporaryFile(prefix="._omega_b043_",suffix=".tmp",dir=destination.parent,delete=False) as output:
            temp_path=Path(output.name)
            for part in parts:
                source=folder/part["part"]
                source=safe_under(root,(Path(args["archive_folder"])/part["part"]).as_posix(),True)
                if not source.is_file() or source.stat().st_size!=part["part_bytes"]:
                    raise ValueError("R947_ORIGINAL_PART_SIZE_MISMATCH_HELD")
                with source.open("rb") as source_stream:
                    outer_hash=_sha_file(source_stream)
                    if outer_hash!=part["part_sha256"]:
                        raise ValueError("R947_ORIGINAL_PART_SHA256_MISMATCH_HELD")
                    try:
                        with zipfile.ZipFile(source_stream,"r") as wrapper:
                            infos=wrapper.infolist()
                            if len(infos)!=1 or infos[0].filename!=part["chunk"] or infos[0].flag_bits&1:
                                raise ValueError("R947_ORIGINAL_WRAPPER_MEMBERS_HELD")
                            if infos[0].file_size!=part["chunk_bytes"]:
                                raise ValueError("R947_ORIGINAL_CHUNK_SIZE_MISMATCH_HELD")
                            chunk_hash=hashlib.sha256()
                            chunk_written=0
                            with wrapper.open(infos[0]) as chunk_stream:
                                while block:=chunk_stream.read(CHUNK):
                                    chunk_written+=len(block)
                                    if chunk_written>part["chunk_bytes"] or written+len(block)>expected_bytes:
                                        raise ValueError("R947_CHUNK_EXPANSION_BUDGET_HELD")
                                    chunk_hash.update(block)
                                    master_hash.update(block)
                                    output.write(block)
                                    written+=len(block)
                            if chunk_written!=part["chunk_bytes"] or chunk_hash.hexdigest()!=part["chunk_sha256"]:
                                raise ValueError("R947_ORIGINAL_CHUNK_SHA256_MISMATCH_HELD")
                    except (zipfile.BadZipFile, EOFError) as exc:
                        raise ValueError("R947_WRAPPER_ZIP_CRC_HELD") from exc
                    witnesses.append({"index":part["index"],"filename":part["part"],"outerSha256":outer_hash,
                                      "chunkSha256":chunk_hash.hexdigest(),"chunkBytes":chunk_written,"zipCrc":"PASS"})
            output.flush()
            os.fsync(output.fileno())
        if written!=expected_bytes or master_hash.hexdigest()!=expected_sha256:
            raise ValueError("R947_MASTER_SHA256_OR_LENGTH_MISMATCH_HELD")
        # Hard-link is an atomic no-overwrite publication on the same volume.
        # A filesystem without hard-link support holds rather than replacing any file.
        try:
            os.link(temp_path,destination)
        except FileExistsError as exc:
            raise ValueError("R947_DESTINATION_ALREADY_EXISTS_HELD") from exc
        except OSError as exc:
            raise ValueError("R947_ATOMIC_NO_OVERWRITE_PUBLISH_UNAVAILABLE_HELD") from exc
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
    return {"schema":"OMEGA_B043_EXACT_STREAMED_RECONSTRUCTION_R947","archiveBuild":RELEASE,
            "sourceManifestSha256":hashlib.sha256(raw_manifest).hexdigest(),
            "destination":Path(args["destination"]).as_posix(),"masterSha256":master_hash.hexdigest(),
            "masterBytes":written,"verifiedWrapperCount":len(witnesses),"partWitnesses":witnesses,
            "sourceExactByteReconstruction":True,"donorCodeExecuted":False,"nativeDeviceProven":False,
            "historicalRuntimeParityProven":False,"canonWrites":0,"productionCertified":False}
 
def reconstruct_b043_r947(root: Path,args:dict,safe_under):
    return _assemble_parts_r947(root,args,safe_under,expected_count=PART_COUNT,
                                 expected_sha256=MASTER_SHA256,expected_bytes=MASTER_BYTES)
