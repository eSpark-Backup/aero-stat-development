#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737554340
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Wed Jan 22  6:59:00 PM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "86f76ae3eceebaf755fce5cebac25199616bcc3e"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
