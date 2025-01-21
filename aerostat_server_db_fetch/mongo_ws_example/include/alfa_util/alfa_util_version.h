#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737484751
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Tue Jan 21 11:39:11 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "0dfa26789ac14294401e846a497d4f50b7aabd07"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
