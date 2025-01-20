#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

#define BUILD_DATE 1737399734
#define MAJOR 1
#define MINOR 0
#define BATCH 0

#define STRINGIFY(x) #x
#define TOSTRING(x) STRINGIFY(x)

#define VERSION_STR TOSTRING(MAJOR) "." TOSTRING(MINOR) "." TOSTRING(BATCH)

#define DEVELOPER "maaz@esparkconsultants.com"
#define COMPILE_TIME "Tue Jan 21 12:02:14 AM PST 2025"
#define CURRENT_BRANCH "websocket-setup"
#define COMMIT_HASH "3a194adf0ddc1e1b65bb38450e6ffef76ea1eab8"

#ifdef __cplusplus
}
#endif

#endif // __VERSION_H__
