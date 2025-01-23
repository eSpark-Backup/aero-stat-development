#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737645032
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Thu Jan 23  8:10:32 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "ef22aad68cb292a28b0700d486acf5d9bf02095d"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
