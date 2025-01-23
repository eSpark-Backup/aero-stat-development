#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737637338
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Thu Jan 23  6:02:18 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "a3216b3496b9b47f93defedc0588c7c7f7a8bfe1"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
